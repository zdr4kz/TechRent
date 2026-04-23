const { read, readQuery } = require('../config/database');

const resumoAdmin = async (req, res) => {
  try {
    const chamadosData = await readQuery(`SELECT status, total FROM view_resumo_chamados`);
    const equipamentosData = await readQuery(`SELECT status, total FROM view_resumo_equipamentos`);
    const usuariosData = await readQuery(`SELECT nivel_acesso, COUNT(*) as total FROM usuarios GROUP BY nivel_acesso`);
    const ultimosChamados = await readQuery(`
      SELECT c.id, c.titulo, c.prioridade, c.status,
             u.nome as cliente, e.nome as equipamento, c.aberto_em
      FROM chamados c
      JOIN usuarios u ON c.cliente_id = u.id
      JOIN equipamentos e ON c.equipamento_id = e.id
      ORDER BY c.aberto_em DESC
      LIMIT 5
    `);

    res.json({ success: true, data: { chamados: chamadosData, equipamentos: equipamentosData, usuarios: usuariosData, ultimosChamados } });
  } catch (error) {
    console.error('Erro ao buscar resumo admin:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar resumo do dashboard' });
  }
};

const painelTecnico = async (req, res) => {
  try {
    const chamados = await readQuery(`SELECT * FROM view_painel_tecnico`);
    res.json({ success: true, data: chamados });
  } catch (error) {
    console.error('Erro ao buscar painel técnico:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar painel técnico' });
  }
};

const stats = async (req, res) => {
  try {
    const totalStatus = await readQuery(`SELECT status, COUNT(*) as count FROM chamados GROUP BY status`);
    const equipStatus = await readQuery(`SELECT status, COUNT(*) as count FROM equipamentos GROUP BY status`);
    const prioridade = await readQuery(`SELECT prioridade, COUNT(*) as count FROM chamados GROUP BY prioridade`);

    res.json({ success: true, data: { chamadosPorStatus: totalStatus, equipamentosPorStatus: equipStatus, chamadosPorPrioridade: prioridade } });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
  }
};

module.exports = { resumoAdmin, painelTecnico, stats };