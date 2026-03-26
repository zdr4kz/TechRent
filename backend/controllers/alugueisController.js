// =============================================
// CONTROLLER DE ALUGUÉIS (CHAMADOS)
// =============================================
// No contexto do MVP de TI, "alugueis" representa os chamados de atendimento.
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /alugueis - lista chamados (admin/técnico veem todos; cliente vê só os seus)
const listar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'listar alugueis - não implementado' });
};

// GET /alugueis/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {
  // TODO
  res.json({ mensagem: 'buscarPorId - não implementado' });
};

// POST /alugueis - abre um novo chamado (cliente)
const criar = async (req, res) => {
  // TODO: inserir em alugueis e, opcionalmente, atualizar equipamentos.status
  res.json({ mensagem: 'criar aluguel - não implementado' });
};

// PUT /alugueis/:id/status - atualiza o status do chamado (técnico/admin)
const atualizarStatus = async (req, res) => {
  // TODO: ex: pendente -> ativo -> finalizado
  res.json({ mensagem: 'atualizarStatus - não implementado' });
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
