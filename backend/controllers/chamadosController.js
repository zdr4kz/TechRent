// =============================================
// CONTROLLER DE CHAMADOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
//
// Fluxo de status:
//   aberto -> em_atendimento -> resolvido
//                           -> cancelado

const { read } = require('../config/database.js');

// GET /chamados - lista chamados
//   admin/técnico -> todos os chamados
//   cliente       -> apenas os seus (WHERE cliente_id = req.usuario.id)
const listar = async (req, res) => {

  if(req.usuario.nivel_acesso == "admin" || req.usuario.nivel_acesso == "tecnico") {

    const chamados = await read("chamados")

    return res.json({
      sucesso: true,
      mensagem: "listado todos os chamados",
      data: chamados
    })
  }
  if(req.usuario.nivel_acesso == "cliente") {

    const chamados = await read("chamados", `cliente_id = ${req.usuario.id}`)

    return res.json({
      sucesso: true,
      mensagem: "listado todos os chamados do cliente",
      data : chamados
    })
  } else {
    return res.json({
      mensagem: "listar todos os chamados - não implementado"
    })
  }
};

// GET /chamados/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {
  // TODO
  res.json({ mensagem: 'buscarPorId - não implementado' });
};

// POST /chamados - abre um novo chamado (cliente/admin)
// Body esperado: { titulo, descricao, equipamento_id, prioridade }
const criar = async (req, res) => {
  // TODO: inserir em chamados com cliente_id = req.usuario.id
  //       e atualizar equipamentos.status para 'em_manutencao'
  res.json({ mensagem: 'criar chamado - não implementado' });
};

// PUT /chamados/:id/status - atualiza o status do chamado (técnico/admin)
// Body esperado: { status, tecnico_id (opcional) }
const atualizarStatus = async (req, res) => {
  // TODO: ex: aberto -> em_atendimento -> resolvido
  //       ao resolver, atualizar equipamentos.status para 'operacional'
  res.json({ mensagem: 'atualizarStatus - não implementado' });
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
