// =============================================
// CONTROLLER DE CHAMADOS
// =============================================
// Tabela principal: chamados
// Fluxo de status: aberto -> em_atendimento -> resolvido | cancelado

const { read, readQuery, create } = require('../config/database.js');

// =============================================
// GET /chamados
// admin/técnico -> todos os chamados
// cliente       -> apenas os seus (WHERE cliente_id = req.usuario.id)
// =============================================
const listar = async (req, res) => {
  try {
    const base = `
      SELECT
        c.id,
        c.titulo,
        c.descricao,
        c.status,
        c.prioridade,
        c.aberto_em     AS abertura,
        c.atualizado_em AS atualizado,
        e.id            AS equipamento_id,
        e.nome          AS equipamento,
        e.categoria     AS equipamento_categoria,
        u_cli.id        AS cliente_id,
        u_cli.nome      AS cliente,
        u_tec.id        AS tecnico_id,
        u_tec.nome      AS tecnico
      FROM chamados c
      JOIN equipamentos e        ON e.id = c.equipamento_id
      JOIN usuarios u_cli        ON u_cli.id = c.cliente_id
      LEFT JOIN usuarios u_tec   ON u_tec.id = c.tecnico_id
    `

    let chamados

    if (req.usuario.nivel_acesso === 'admin' || req.usuario.nivel_acesso === 'tecnico') {
      chamados = await readQuery(base + ' ORDER BY c.aberto_em DESC')
    } else if (req.usuario.nivel_acesso === 'cliente') {
      chamados = await readQuery(base + ' WHERE c.cliente_id = ? ORDER BY c.aberto_em DESC', [req.usuario.id])
    } else {
      return res.status(403).json({ sucesso: false, mensagem: 'Nível de acesso não permitido' })
    }

    return res.json({ sucesso: true, data: chamados })

  } catch (err) {
    console.error('[listar chamados]', err)
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar chamados' })
  }
}

// =============================================
// GET /chamados/:id
// Retorna um chamado pelo ID (com histórico de manutenção)
// cliente só pode ver o próprio chamado
// =============================================
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params

    const [chamado] = await readQuery(`
      SELECT
        c.id,
        c.titulo,
        c.descricao,
        c.status,
        c.prioridade,
        c.aberto_em     AS abertura,
        c.atualizado_em AS atualizado,
        e.id            AS equipamento_id,
        e.nome          AS equipamento,
        e.categoria     AS equipamento_categoria,
        u_cli.id        AS cliente_id,
        u_cli.nome      AS cliente,
        u_tec.id        AS tecnico_id,
        u_tec.nome      AS tecnico
      FROM chamados c
      JOIN equipamentos e        ON e.id = c.equipamento_id
      JOIN usuarios u_cli        ON u_cli.id = c.cliente_id
      LEFT JOIN usuarios u_tec   ON u_tec.id = c.tecnico_id
      WHERE c.id = ?
    `, [id])

    if (!chamado) {
      return res.status(404).json({ sucesso: false, mensagem: 'Chamado não encontrado' })
    }

    // Cliente só pode ver o próprio chamado
    if (req.usuario.nivel_acesso === 'cliente' && chamado.cliente_id !== req.usuario.id) {
      return res.status(403).json({ sucesso: false, mensagem: 'Acesso negado' })
    }

    // Histórico de manutenção do chamado
    const historico = await readQuery(`
      SELECT
        h.id,
        h.descricao,
        h.registrado_em,
        u.nome AS tecnico
      FROM historico_manutencao h
      JOIN usuarios u ON u.id = h.tecnico_id
      WHERE h.chamado_id = ?
      ORDER BY h.registrado_em ASC
    `, [id])

    return res.json({ sucesso: true, data: { ...chamado, historico } })

  } catch (err) {
    console.error('[buscarPorId]', err)
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno' })
  }
}

// =============================================
// POST /chamados
// Abre um novo chamado (apenas cliente ou admin)
// Body: { titulo, descricao, equipamento_id, prioridade }
// =============================================
const criar = async (req, res) => {
  try {
    const { titulo, descricao, equipamento_id, prioridade } = req.body

    if (!titulo || !equipamento_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'titulo e equipamento_id são obrigatórios' })
    }

    // Verifica se o equipamento existe e está operacional
    const [equipamento] = await readQuery(
      `SELECT id, status FROM equipamentos WHERE id = ?`, [equipamento_id]
    )

    if (!equipamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Equipamento não encontrado' })
    }

    if (equipamento.status !== 'operacional') {
      return res.status(400).json({ sucesso: false, mensagem: 'Equipamento não está disponível para chamado' })
    }

    // Cria o chamado
    const novoChamadoId = await create('chamados', {
      titulo,
      descricao: descricao || null,
      cliente_id: req.usuario.id,
      equipamento_id,
      prioridade: prioridade || 'media',
      status: 'aberto',
    })

    // Atualiza o equipamento para em_manutencao
    await readQuery(
      `UPDATE equipamentos SET status = 'em_manutencao' WHERE id = ?`, [equipamento_id]
    )

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Chamado aberto com sucesso',
      data: { id: novoChamadoId }
    })

  } catch (err) {
    console.error('[criar chamado]', err)
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao criar chamado' })
  }
}

// =============================================
// PUT /chamados/:id/status
// Atualiza o status do chamado (técnico ou admin)
// Body: { status, tecnico_id? }
//
// Transições permitidas:
//   aberto         -> em_atendimento | cancelado
//   em_atendimento -> resolvido      | cancelado
// =============================================
const atualizarStatus = async (req, res) => {
  try {
    console.log('[atualizarStatus] Iniciando...')
    console.log('[atualizarStatus] req.params:', req.params)
    console.log('[atualizarStatus] req.body:', req.body)
    console.log('[atualizarStatus] req.usuario:', req.usuario)

    const { id } = req.params
    const { status, tecnico_id } = req.body

    const statusPermitidos = ['aberto', 'em_atendimento', 'resolvido', 'cancelado']
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ sucesso: false, mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}` })
    }

    // Busca o chamado atual
    const [chamado] = await readQuery(
      `SELECT id, status, equipamento_id, tecnico_id FROM chamados WHERE id = ?`, [Number(id)]
    )

    console.log('[atualizarStatus] Chamado encontrado:', chamado)

    if (!chamado) {
      return res.status(404).json({ sucesso: false, mensagem: 'Chamado não encontrado' })
    }

    // Validação de transições
    const transicoesValidas = {
      aberto: ['em_atendimento', 'cancelado'],
      em_atendimento: ['resolvido', 'cancelado'],
      resolvido: [],
      cancelado: [],
    }

    if (!transicoesValidas[chamado.status]?.includes(status)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível ir de "${chamado.status}" para "${status}"`
      })
    }

    // Define o técnico: usa o do body, ou o do próprio usuário logado (se for técnico), ou mantém o atual
    const novoTecnicoId =
      tecnico_id ??
      (req.usuario.nivel_acesso === 'tecnico' ? req.usuario.id : chamado.tecnico_id)

    console.log('[atualizarStatus] Novo técnico_id:', novoTecnicoId)

    // Atualiza o chamado
    await readQuery(
      `UPDATE chamados SET status = ?, tecnico_id = ? WHERE id = ?`,
      [status, novoTecnicoId, Number(id)]
    )

    console.log('[atualizarStatus] Chamado atualizado')

    // Atualiza o status do equipamento conforme o status do chamado
    let novoStatusEquipamento = null
    if (status === 'resolvido' || status === 'cancelado') {
      novoStatusEquipamento = 'operacional'
    } else if (status === 'em_atendimento') {
      novoStatusEquipamento = 'em_manutencao'
    }

    if (novoStatusEquipamento) {
      await readQuery(
        `UPDATE equipamentos SET status = ? WHERE id = ?`,
        [novoStatusEquipamento, chamado.equipamento_id]
      )
      console.log('[atualizarStatus] Equipamento atualizado')
    }

    return res.json({ sucesso: true, mensagem: `Chamado atualizado para "${status}"` })

  } catch (err) {
    console.error('[atualizarStatus] Erro completo:', err)
    console.error('[atualizarStatus] Stack:', err.stack)
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno', erro: err.message })
  }
}

module.exports = { listar, buscarPorId, criar, atualizarStatus }