// =============================================
// CONTROLLER DE HISTÓRICO DE MANUTENÇÃO
// =============================================
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /manutencao - lista todos os registros de manutenção (admin/técnico)
const listar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'listar manutenções - não implementado' });
};

// POST /manutencao - registra um reparo em um equipamento (técnico)
const registrar = async (req, res) => {
  // TODO: inserir em historico_manutencao e atualizar status do equipamento
  res.json({ mensagem: 'registrar manutenção - não implementado' });
};

module.exports = { listar, registrar };
