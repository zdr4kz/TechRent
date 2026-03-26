// =============================================
// CONTROLLER DE DASHBOARD
// =============================================
// Usa as VIEWS do banco para retornar dados agregados.
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /dashboard/admin - resumo geral por status de equipamento (apenas admin)
// Usa a view: view_resumo_admin
const resumoAdmin = async (req, res) => {
  // TODO
  res.json({ mensagem: 'resumoAdmin - não implementado' });
};

// GET /dashboard/tecnico - chamados abertos/em andamento (técnico/admin)
// Usa a view: view_painel_tecnico
const painelTecnico = async (req, res) => {
  // TODO
  res.json({ mensagem: 'painelTecnico - não implementado' });
};

module.exports = { resumoAdmin, painelTecnico };
