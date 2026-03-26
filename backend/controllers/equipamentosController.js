// =============================================
// CONTROLLER DE EQUIPAMENTOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
// Cada função recebe (req, res) e deve retornar uma resposta JSON.

const db = require('../config/database');

// GET /equipamentos - lista todos (admin/técnico) ou só disponíveis (cliente)
const listar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'listar equipamentos - não implementado' });
};

// GET /equipamentos/:id - retorna um equipamento pelo ID
const buscarPorId = async (req, res) => {
  // TODO
  res.json({ mensagem: 'buscarPorId - não implementado' });
};

// POST /equipamentos - cria um novo equipamento (apenas admin)
const criar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'criar equipamento - não implementado' });
};

// PUT /equipamentos/:id - atualiza um equipamento (apenas admin)
const atualizar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'atualizar equipamento - não implementado' });
};

// DELETE /equipamentos/:id - remove um equipamento (apenas admin)
const remover = async (req, res) => {
  // TODO
  res.json({ mensagem: 'remover equipamento - não implementado' });
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
