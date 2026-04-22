// =============================================
// CONTROLLER DE EQUIPAMENTOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
// Cada função recebe (req, res) e deve retornar uma resposta JSON.

const db = require('../config/database');

// GET /equipamentos - lista todos os equipamentos do inventário
const listar = async (req, res) => {
  try {
    const { readQuery } = require('../config/database.js');
    const equipamentos = await readQuery(`
      SELECT id, nome, categoria, patrimonio, status, descricao
      FROM equipamentos
      ORDER BY nome ASC
    `);

    return res.json({
      sucesso: true,
      mensagem: "Equipamentos listados com sucesso",
      data: equipamentos || []
    });
  } catch (error) {
    console.error("Erro ao listar equipamentos:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar equipamentos"
    });
  }
};

// GET /equipamentos/:id - retorna um equipamento pelo ID
const buscarPorId = async (req, res) => {
  try {
    const { readQuery } = require('../config/database.js');
    const { id } = req.params;

    const [equipamento] = await readQuery(`
      SELECT id, nome, categoria, patrimonio, status, descricao
      FROM equipamentos
      WHERE id = ?
    `, [id]);

    if (!equipamento) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Equipamento não encontrado"
      });
    }

    return res.json({
      sucesso: true,
      data: equipamento
    });
  } catch (error) {
    console.error("Erro ao buscar equipamento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar equipamento"
    });
  }
};

// POST /equipamentos - cria um novo equipamento (apenas admin)
const criar = async (req, res) => {
  try {
    const { create } = require('../config/database.js');
    const { nome, categoria, patrimonio, status, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome do equipamento é obrigatório"
      });
    }

    const novoId = await create('equipamentos', {
      nome,
      categoria: categoria || null,
      patrimonio: patrimonio || null,
      status: status || 'operacional',
      descricao: descricao || null
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Equipamento criado com sucesso",
      data: { id: novoId }
    });
  } catch (error) {
    console.error("Erro ao criar equipamento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar equipamento"
    });
  }
};

// PUT /equipamentos/:id - atualiza um equipamento (apenas admin)
const atualizar = async (req, res) => {
  try {
    const { readQuery } = require('../config/database.js');
    const { id } = req.params;
    const { nome, categoria, patrimonio, status, descricao } = req.body;

    const [equipamento] = await readQuery(
      `SELECT id FROM equipamentos WHERE id = ?`, [id]
    );

    if (!equipamento) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Equipamento não encontrado"
      });
    }

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (categoria !== undefined) {
      updates.push('categoria = ?');
      values.push(categoria);
    }
    if (patrimonio !== undefined) {
      updates.push('patrimonio = ?');
      values.push(patrimonio);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nenhum campo para atualizar"
      });
    }

    values.push(id);
    await readQuery(
      `UPDATE equipamentos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return res.json({
      sucesso: true,
      mensagem: "Equipamento atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar equipamento"
    });
  }
};

// DELETE /equipamentos/:id - remove um equipamento (apenas admin)
const remover = async (req, res) => {
  try {
    const { readQuery } = require('../config/database.js');
    const { id } = req.params;

    const [equipamento] = await readQuery(
      `SELECT id FROM equipamentos WHERE id = ?`, [id]
    );

    if (!equipamento) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Equipamento não encontrado"
      });
    }

    await readQuery(`DELETE FROM equipamentos WHERE id = ?`, [id]);

    return res.json({
      sucesso: true,
      mensagem: "Equipamento removido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao remover equipamento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao remover equipamento"
    });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
