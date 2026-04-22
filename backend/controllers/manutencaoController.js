// =============================================
// CONTROLLER DE HISTÓRICO DE MANUTENÇÃO
// =============================================
// Registra e lista reparos realizados por técnicos

const { readQuery, create } = require('../config/database.js');

// GET /manutencao - lista todos os registros de manutenção (admin/técnico)
const listar = async (req, res) => {
  try {
    const historico = await readQuery(`
      SELECT
        h.id,
        h.chamado_id,
        h.equipamento_id,
        h.tecnico_id,
        h.descricao,
        h.registrado_em,
        u.nome AS tecnico,
        e.nome AS equipamento,
        c.titulo AS chamado_titulo
      FROM historico_manutencao h
      JOIN usuarios u ON u.id = h.tecnico_id
      JOIN equipamentos e ON e.id = h.equipamento_id
      JOIN chamados c ON c.id = h.chamado_id
      ORDER BY h.registrado_em DESC
    `);

    return res.json({
      sucesso: true,
      mensagem: "Histórico de manutenção listado com sucesso",
      data: historico || []
    });
  } catch (error) {
    console.error("Erro ao listar histórico de manutenção:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar histórico de manutenção"
    });
  }
};

// POST /manutencao - registra um reparo em um equipamento (técnico)
// Body esperado: { chamado_id, equipamento_id, descricao }
// Após registrar:
//   1. Cria registro em historico_manutencao
//   2. Atualiza chamados.status para 'resolvido'
//   3. Atualiza equipamentos.status para 'operacional'
const registrar = async (req, res) => {
  try {
    const { chamado_id, equipamento_id, descricao } = req.body;

    if (!chamado_id || !equipamento_id || !descricao) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "chamado_id, equipamento_id e descricao são obrigatórios"
      });
    }

    // Verifica se o chamado existe
    const [chamado] = await readQuery(
      `SELECT id, status FROM chamados WHERE id = ?`, [chamado_id]
    );

    if (!chamado) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Chamado não encontrado"
      });
    }

    // Verifica se o equipamento existe
    const [equipamento] = await readQuery(
      `SELECT id FROM equipamentos WHERE id = ?`, [equipamento_id]
    );

    if (!equipamento) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Equipamento não encontrado"
      });
    }

    // Cria o registro de manutenção
    const manutencaoId = await create('historico_manutencao', {
      chamado_id,
      equipamento_id,
      tecnico_id: req.usuario.id,
      descricao
    });

    // Atualiza o chamado para resolvido
    await readQuery(
      `UPDATE chamados SET status = 'resolvido' WHERE id = ?`, [chamado_id]
    );

    // Atualiza o equipamento para operacional
    await readQuery(
      `UPDATE equipamentos SET status = 'operacional' WHERE id = ?`, [equipamento_id]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Manutenção registrada com sucesso",
      data: { id: manutencaoId }
    });
  } catch (error) {
    console.error("Erro ao registrar manutenção:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao registrar manutenção"
    });
  }
};

module.exports = { listar, registrar };
