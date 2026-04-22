"use client"

import { useState, useEffect } from "react"

// =============================================
// PAINEL DO TÉCNICO — /dashboard/tecnico
// Usa: view_painel_tecnico (chamados aberto/em_atendimento)
// Ações: assumir chamado, registrar reparo, resolver
// Schema: chamados + historico_manutencao + equipamentos
// =============================================

const STATUS_CONFIG = {
    aberto: { label: "Aberto", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", dot: "#F59E0B", border: "rgba(245,158,11,0.3)" },
    em_atendimento: { label: "Em Atendimento", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", dot: "#60A5FA", border: "rgba(96,165,250,0.3)" },
    resolvido: { label: "Resolvido", color: "#34D399", bg: "rgba(52,211,153,0.12)", dot: "#34D399", border: "rgba(52,211,153,0.3)" },
    cancelado: { label: "Cancelado", color: "#F87171", bg: "rgba(248,113,113,0.12)", dot: "#F87171", border: "rgba(248,113,113,0.3)" },
}

const PRIORIDADE_CONFIG = {
    baixa: { label: "Baixa", color: "#A1A1AA", bg: "rgba(161,161,170,0.1)" },
    media: { label: "Média", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
    alta: { label: "Alta", color: "#F87171", bg: "rgba(248,113,113,0.1)" },
}

// Mock do técnico logado (virá do JWT em produção)
const TECNICO_MOCK = { id: 3, nome: "Carlos Silva", email: "carlos@techrent.com" }

const MOCK_CHAMADOS = [
    { id: 1, titulo: "Notebook não liga", descricao: "O equipamento não responde ao botão de energia mesmo conectado à tomada.", status: "aberto", prioridade: "alta", equipamento: "Laptop Dell XPS", equipamento_id: 1, equipamento_categoria: "Notebook", tecnico_id: null, tecnico: null, cliente: "Mariana Souza", aberto_em: "2025-07-08T09:00:00", atualizado_em: "2025-07-08T09:00:00" },
    { id: 2, titulo: "Projetor sem sinal HDMI", descricao: "Cabo conectado porém a tela fica preta ao tentar projetar.", status: "em_atendimento", prioridade: "media", equipamento: "Projetor Epson X41", equipamento_id: 2, equipamento_categoria: "Projetor", tecnico_id: 3, tecnico: "Carlos Silva", cliente: "Felipe Rocha", aberto_em: "2025-07-07T11:20:00", atualizado_em: "2025-07-08T08:00:00" },
    { id: 3, titulo: "Teclado com teclas travadas", descricao: "Várias teclas do lado direito não respondem ao pressionar.", status: "aberto", prioridade: "baixa", equipamento: "Teclado Mecânico K2", equipamento_id: 3, equipamento_categoria: "Periférico", tecnico_id: null, tecnico: null, cliente: "Beatriz Lima", aberto_em: "2025-07-08T15:45:00", atualizado_em: "2025-07-08T15:45:00" },
    { id: 4, titulo: "Impressora offline", descricao: "Impressora aparece como offline na fila do Windows apesar de ligada.", status: "em_atendimento", prioridade: "alta", equipamento: "Impressora HP LaserJet", equipamento_id: 4, equipamento_categoria: "Impressora", tecnico_id: 3, tecnico: "Carlos Silva", cliente: "Rodrigo Mendes", aberto_em: "2025-07-07T07:00:00", atualizado_em: "2025-07-08T10:00:00" },
    { id: 5, titulo: "Monitor piscando", descricao: "A tela pisca a cada 30 segundos aproximadamente.", status: "aberto", prioridade: "media", equipamento: "Monitor LG 24''", equipamento_id: 5, equipamento_categoria: "Monitor", tecnico_id: null, tecnico: null, cliente: "Juliana Neves", aberto_em: "2025-07-08T09:30:00", atualizado_em: "2025-07-08T09:30:00" },
    { id: 6, titulo: "HD externo não reconhecido", descricao: "Windows não detecta o dispositivo em nenhuma porta USB.", status: "resolvido", prioridade: "baixa", equipamento: "HD Externo 1TB", equipamento_id: 6, equipamento_categoria: "Armazenamento", tecnico_id: 3, tecnico: "Carlos Silva", cliente: "Thiago Alves", aberto_em: "2025-07-05T13:00:00", atualizado_em: "2025-07-07T16:00:00" },
]

const C = {
    bg: "#09090B",
    surface: "#111113",
    card: "#18181B",
    border: "#27272A",
    borderHover: "#3F3F46",
    textPrimary: "#FAFAFA",
    textSecondary: "#D4D4D8",
    textMuted: "#A1A1AA",
    accent: "#60A5FA",
    accentDim: "rgba(96,165,250,0.15)",
    green: "#34D399",
    yellow: "#F59E0B",
    red: "#F87171",
}

// ---- Utils ----
function hexToRgb(hex) {
    if (!hex || !hex.startsWith("#")) return "255,255,255"
    return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(",")
}
function formatDate(iso) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function formatDateTime(iso) {
    if (!iso) return "—"
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
function diasAberto(iso) {
    if (!iso) return 0
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

// ---- Subcomponentes ----

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: C.textMuted, bg: C.card, dot: C.textMuted, border: C.border }
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 6,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {cfg.label}
        </span>
    )
}

function PrioridadeBadge({ prioridade }) {
    const cfg = PRIORIDADE_CONFIG[prioridade] || { label: prioridade, color: C.textMuted, bg: C.card }
    return (
        <span style={{
            fontSize: 11, fontWeight: 500, color: cfg.color, background: cfg.bg,
            padding: "2px 8px", borderRadius: 4, letterSpacing: 0.2,
        }}>{cfg.label}</span>
    )
}

function StatCard({ label, value, color, sublabel, active, onClick }) {
    return (
        <div onClick={onClick} style={{
            background: active ? `rgba(${hexToRgb(color)},0.07)` : C.card,
            border: `1px solid ${active ? color + "50" : C.border}`,
            borderRadius: 12, padding: "18px 20px", cursor: onClick ? "pointer" : "default",
            transition: "all 0.15s", position: "relative", overflow: "hidden",
        }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.borderHover }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border }}
        >
            {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />}
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: active ? color : C.textPrimary, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            {sublabel && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sublabel}</div>}
        </div>
    )
}

// ---- Modal: Assumir chamado ----
function AssumirModal({ chamado, onClose, onConfirm }) {
    if (!chamado) return null
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div style={{ background: C.card, borderRadius: 14, padding: 28, maxWidth: 440, width: "100%", border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Assumir Chamado #{chamado.id}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Você será designado como técnico responsável por este chamado.</div>

                <div style={{ background: C.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>{chamado.titulo}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{chamado.equipamento}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border }} />
                        <PrioridadeBadge prioridade={chamado.prioridade} />
                    </div>
                    {chamado.descricao && (
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                            {chamado.descricao}
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textSecondary, fontWeight: 500, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancelar</button>
                    <button onClick={() => onConfirm(chamado.id)} style={{ flex: 2, padding: "9px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                        Assumir Chamado
                    </button>
                </div>
            </div>
        </div>
    )
}

// ---- Modal: Registrar reparo e resolver ----
function ResolverModal({ chamado, onClose, onConfirm }) {
    const [descricao, setDescricao] = useState("")
    const [enviando, setEnviando] = useState(false)
    if (!chamado) return null

    async function handleSubmit() {
        if (!descricao.trim()) return
        setEnviando(true)
        try {
            const token = localStorage.getItem("token")
            // POST /api/manutencao — insere em historico_manutencao
            await fetch("/api/manutencao", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    chamado_id: chamado.id,
                    equipamento_id: chamado.equipamento_id,
                    descricao,
                }),
            })
            // PATCH /api/chamados/:id — atualiza status para resolvido
            await fetch(`/api/chamados/${chamado.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "resolvido", tecnico_id: TECNICO_MOCK.id }),
            })
        } catch (e) {
            console.error(e)
        } finally {
            setEnviando(false)
            onConfirm(chamado.id, descricao)
            onClose()
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div style={{ background: C.card, borderRadius: 14, padding: 28, maxWidth: 480, width: "100%", border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Registrar Reparo</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Descreva o que foi feito. O chamado será marcado como resolvido.</div>

                <div style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{chamado.titulo}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{chamado.equipamento} · Cliente: {chamado.cliente}</div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, display: "block", marginBottom: 6 }}>
                        Descrição do reparo <span style={{ color: C.red }}>*</span>
                    </label>
                    <textarea
                        placeholder="Descreva o que foi identificado e o procedimento realizado..."
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        rows={4}
                        style={{
                            width: "100%", padding: "9px 12px", borderRadius: 8, boxSizing: "border-box",
                            border: `1px solid ${C.border}`, fontSize: 13, color: C.textPrimary,
                            fontFamily: "inherit", outline: "none", background: C.surface, resize: "none",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={e => e.target.style.borderColor = C.green}
                        onBlur={e => e.target.style.borderColor = C.border}
                    />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textSecondary, fontWeight: 500, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancelar</button>
                    <button onClick={handleSubmit} disabled={enviando || !descricao.trim()} style={{
                        flex: 2, padding: "9px 16px", borderRadius: 8, border: "none",
                        background: !descricao.trim() ? C.borderHover : C.green,
                        color: !descricao.trim() ? C.textMuted : "#fff",
                        fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                        transition: "all 0.15s",
                    }}>
                        {enviando ? "Salvando..." : "Resolver Chamado"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ---- Modal: Detalhes + histórico ----
function DetalheModal({ chamado, historico, onClose }) {
    if (!chamado) return null
    const meusChamados = historico.filter(h => h.chamado_id === chamado.id)
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div style={{ background: C.card, borderRadius: 14, padding: 28, maxWidth: 540, width: "100%", border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Chamado #{chamado.id}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>{chamado.titulo}</div>
                    </div>
                    <button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 13, color: C.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ height: 1, background: C.border, margin: "0 0 18px" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                    {[
                        ["Status", <StatusBadge status={chamado.status} />],
                        ["Prioridade", <PrioridadeBadge prioridade={chamado.prioridade} />],
                        ["Equipamento", chamado.equipamento],
                        ["Categoria", chamado.equipamento_categoria || "—"],
                        ["Cliente", chamado.cliente || "—"],
                        ["Aberto em", formatDateTime(chamado.aberto_em)],
                        ["Última atualização", formatDateTime(chamado.atualizado_em)],
                        ["Dias em aberto", `${diasAberto(chamado.aberto_em)} dias`],
                    ].map(([k, v]) => (
                        <div key={k} style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{k}</div>
                            <div style={{ fontSize: 13, color: C.textSecondary }}>{v}</div>
                        </div>
                    ))}
                </div>

                {chamado.descricao && (
                    <div style={{ background: C.surface, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}`, marginBottom: 18 }}>
                        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Descrição do Problema</div>
                        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{chamado.descricao}</div>
                    </div>
                )}

                {meusChamados.length > 0 && (
                    <>
                        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Histórico de Manutenção</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {meusChamados.map((h, i) => (
                                <div key={i} style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", border: `1px solid rgba(52,211,153,0.2)` }}>
                                    <div style={{ fontSize: 11, color: C.green, fontWeight: 500, marginBottom: 4 }}>{formatDateTime(h.registrado_em)} · {h.tecnico}</div>
                                    <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{h.descricao}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ---- Sidebar ----
function Sidebar({ tecnico }) {
    const navItems = [
        { label: "Visão Geral", icon: "▣", href: "/dashboard/tecnico" },
        { label: "Fila de Chamados", icon: "≡", href: "/dashboard/tecnico/fila" },
        { label: "Meus Chamados", icon: "◎", href: "/dashboard/tecnico/meus" },
        { label: "Histórico", icon: "◫", href: "/dashboard/tecnico/historico" },
        { label: "Equipamentos", icon: "⊞", href: "/dashboard/tecnico/equipamentos" },
    ]
    return (
        <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, height: "100vh", position: "sticky", top: 0, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.2 }}>TechRent</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Painel do Técnico</div>
            </div>

            <nav style={{ padding: "10px", flex: 1 }}>
                {navItems.map((item, i) => (
                    <div key={item.label} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 7, marginBottom: 2,
                        background: i === 0 ? C.accentDim : "transparent",
                        color: i === 0 ? C.accent : C.textMuted,
                        fontSize: 13, fontWeight: i === 0 ? 500 : 400,
                        cursor: "pointer", transition: "all 0.12s",
                    }}
                        onMouseEnter={e => { if (i !== 0) e.currentTarget.style.color = C.textSecondary }}
                        onMouseLeave={e => { if (i !== 0) e.currentTarget.style.color = C.textMuted }}
                    >
                        <span style={{ fontSize: 13 }}>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div style={{ padding: "14px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.green, flexShrink: 0 }}>
                        {tecnico.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{tecnico.nome}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Técnico</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ---- Componente Principal ----
export default function DashboardTecnico() {
    const [chamados, setChamados] = useState([])
    const [historico, setHistorico] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState("pendentes") // pendentes | meus | todos | resolvidos
    const [busca, setBusca] = useState("")
    const [chamadoDetalhe, setChamadoDetalhe] = useState(null)
    const [chamadoAssumindo, setChamadoAssumindo] = useState(null)
    const [chamadoResolvendo, setChamadoResolvendo] = useState(null)
    const [usandoMock, setUsandoMock] = useState(false)
    const [tecnico, setTecnico] = useState(TECNICO_MOCK)

    // Helper para decodificar JWT
    function decodeToken(token) {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            )
            return JSON.parse(jsonPayload)
        } catch (e) {
            console.error('Erro ao decodificar token:', e)
            return null
        }
    }

    useEffect(() => {
        async function fetchDados() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                
                // Decodifica o token para pegar dados do técnico logado
                if (token) {
                    const payload = decodeToken(token)
                    if (payload) {
                        console.log('[DashboardTecnico] Técnico logado:', payload)
                        setTecnico({ id: payload.id, nome: payload.nome, email: payload.email })
                    }
                }

                const [rChamados] = await Promise.all([
                    fetch("/api/chamados", { headers: { Authorization: `Bearer ${token}` } }),
                ])
                if (rChamados.ok) {
                    const json = await rChamados.json()
                    setChamados(json.data || [])
                } else {
                    setChamados(MOCK_CHAMADOS); setUsandoMock(true)
                }
            } catch {
                setChamados(MOCK_CHAMADOS); setUsandoMock(true)
            } finally {
                setLoading(false)
            }
        }
        fetchDados()
    }, [])

    // Ação: assumir chamado (PATCH /api/chamados/:id + tecnico_id)
    async function handleAssumirConfirm(id) {
        try {
            const token = localStorage.getItem("token")
            
            console.log('[handleAssumirConfirm] Assumindo chamado:', { id, tecnico_id: tecnico.id })
            
            const response = await fetch(`/api/chamados/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "em_atendimento", tecnico_id: tecnico.id }),
            })
            
            const data = await response.json()
            
            console.log('[handleAssumirConfirm] Resposta:', { status: response.status, data })
            
            if (!response.ok) {
                console.error("Erro ao assumir chamado:", data.mensagem)
                alert("Erro ao assumir chamado: " + (data.mensagem || "Tente novamente"))
                return
            }

            // Recarrega os chamados do servidor para garantir sincronização
            const rChamados = await fetch("/api/chamados", { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            if (rChamados.ok) {
                const json = await rChamados.json()
                setChamados(json.data || [])
            }
        } catch (e) { 
            console.error("[handleAssumirConfirm] Erro:", e)
            alert("Erro ao assumir chamado: " + e.message)
        }
        setChamadoAssumindo(null)
    }

    // Ação: resolver + registrar reparo
    function handleResolverConfirm(id, descricao) {
        const novoHistorico = { chamado_id: id, tecnico: tecnico.nome, descricao, registrado_em: new Date().toISOString() }
        setHistorico(prev => [...prev, novoHistorico])
        setChamados(prev => prev.map(c => c.id === id ? { ...c, status: "resolvido", atualizado_em: new Date().toISOString() } : c))
    }

    // Stats
    const pendentes = chamados.filter(c => c.status === "aberto").length
    const meusChamados = chamados.filter(c => c.tecnico_id === tecnico.id && c.status === "em_atendimento").length
    const resolvidosHoje = chamados.filter(c => c.status === "resolvido" && c.tecnico_id === tecnico.id).length
    const totalAtivos = chamados.filter(c => ["aberto", "em_atendimento"].includes(c.status)).length

    // Filtro aplicado
    const chamadosFiltrados = chamados.filter(c => {
        let matchFiltro = true
        if (filtro === "pendentes") matchFiltro = c.status === "aberto"
        if (filtro === "meus") matchFiltro = c.tecnico_id === tecnico.id && c.status === "em_atendimento"
        if (filtro === "resolvidos") matchFiltro = c.status === "resolvido"
        const matchBusca = !busca
            || c.titulo?.toLowerCase().includes(busca.toLowerCase())
            || c.equipamento?.toLowerCase().includes(busca.toLowerCase())
            || c.cliente?.toLowerCase().includes(busca.toLowerCase())
        return matchFiltro && matchBusca
    })

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                <div style={{ color: C.textMuted, fontSize: 13 }}>Carregando painel...</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )

    const thStyle = {
        padding: "10px 16px", fontSize: 11, fontWeight: 500,
        color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.7,
        textAlign: "left", background: C.surface, borderBottom: `1px solid ${C.border}`,
        whiteSpace: "nowrap",
    }

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Geist', 'DM Sans', 'Segoe UI', sans-serif", display: "flex" }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272A; border-radius: 10px; }
        select option { background: #18181B; color: #FAFAFA; }
      `}</style>

            <Sidebar tecnico={tecnico} />

            <div style={{ flex: 1, overflow: "auto" }}>
                {/* Header */}
                <div style={{
                    background: C.surface, borderBottom: `1px solid ${C.border}`,
                    padding: "0 28px", height: 56,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 100,
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Painel do Técnico</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Gerencie e resolva os chamados atribuídos</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {usandoMock && (
                            <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#FBBF24", fontWeight: 500 }}>
                                Modo demonstração
                            </div>
                        )}
                        {/* Indicador de status do técnico */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 7,
                            background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                            borderRadius: 8, padding: "5px 12px",
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
                            <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>Disponível</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px 28px" }}>

                    {/* Stat Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
                        <StatCard label="Fila de Espera" value={pendentes} color={C.yellow} sublabel="Sem técnico alocado" active={filtro === "pendentes"} onClick={() => setFiltro("pendentes")} />
                        <StatCard label="Meus Chamados" value={meusChamados} color={C.accent} sublabel="Em atendimento" active={filtro === "meus"} onClick={() => setFiltro("meus")} />
                        <StatCard label="Resolvidos" value={resolvidosHoje} color={C.green} sublabel="Por mim" active={filtro === "resolvidos"} onClick={() => setFiltro("resolvidos")} />
                        <StatCard label="Total Ativo" value={totalAtivos} color="#A78BFA" sublabel="Abertos + em atendimento" active={filtro === "todos"} onClick={() => setFiltro("todos")} />
                    </div>

                    {/* Busca + filtros */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 140 }}>
                            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.textMuted, pointerEvents: "none" }}>⊘</span>
                            <input
                                placeholder="Buscar por título, equipamento ou cliente..."
                                value={busca} onChange={e => setBusca(e.target.value)}
                                style={{
                                    width: "100%", paddingLeft: 32, padding: "8px 12px 8px 32px",
                                    borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13,
                                    color: C.textPrimary, outline: "none", fontFamily: "inherit",
                                    background: C.card, transition: "border-color 0.15s",
                                }}
                                onFocus={e => e.target.style.borderColor = C.accent}
                                onBlur={e => e.target.style.borderColor = C.border}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            {[
                                { key: "pendentes", label: "Fila", count: pendentes, color: C.yellow },
                                { key: "meus", label: "Meus", count: meusChamados, color: C.accent },
                                { key: "resolvidos", label: "Resolvidos", count: resolvidosHoje, color: C.green },
                                { key: "todos", label: "Todos", count: totalAtivos, color: "#A1A1AA" },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                                    padding: "6px 12px", borderRadius: 7,
                                    border: `1px solid ${filtro === f.key ? f.color + "50" : C.border}`,
                                    background: filtro === f.key ? `rgba(${hexToRgb(f.color)},0.1)` : "transparent",
                                    color: filtro === f.key ? f.color : C.textMuted,
                                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.12s",
                                }}>
                                    {f.label}
                                    <span style={{
                                        background: filtro === f.key ? `rgba(${hexToRgb(f.color)},0.2)` : C.surface,
                                        color: filtro === f.key ? f.color : C.textMuted,
                                        borderRadius: 4, padding: "0 5px", fontSize: 11, fontWeight: 600,
                                    }}>{f.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabela */}
                    <div style={{ background: C.card, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, width: 52 }}>#</th>
                                    <th style={thStyle}>Chamado / Cliente</th>
                                    <th style={thStyle}>Equipamento</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Prioridade</th>
                                    <th style={thStyle}>Aberto</th>
                                    <th style={{ ...thStyle, textAlign: "right", paddingRight: 20 }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chamadosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: "52px 24px", textAlign: "center", color: C.textMuted }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Nenhum chamado encontrado</div>
                                            <div style={{ fontSize: 12 }}>
                                                {busca ? "Tente outros termos de busca." : "Não há chamados nesta categoria."}
                                            </div>
                                        </td>
                                    </tr>
                                ) : chamadosFiltrados.map((c, i) => {
                                    const ehMeu = c.tecnico_id === tecnico.id
                                    const podeAssumid = c.status === "aberto" && !c.tecnico_id
                                    const podeResolver = c.status === "em_atendimento" && ehMeu

                                    return (
                                        <tr key={c.id}
                                            style={{ borderBottom: i < chamadosFiltrados.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = C.surface}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "13px 16px", fontSize: 12, fontWeight: 500, color: C.textMuted, verticalAlign: "middle" }}>#{c.id}</td>

                                            <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 2 }}>{c.titulo}</div>
                                                <div style={{ fontSize: 11, color: C.textMuted }}>Cliente: {c.cliente || "—"}</div>
                                            </td>

                                            <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                                                <div style={{ fontSize: 13, color: C.textSecondary }}>{c.equipamento}</div>
                                                {c.equipamento_categoria && (
                                                    <span style={{ background: C.surface, padding: "1px 6px", borderRadius: 4, fontSize: 10, color: C.textMuted, border: `1px solid ${C.border}` }}>
                                                        {c.equipamento_categoria}
                                                    </span>
                                                )}
                                            </td>

                                            <td style={{ padding: "13px 16px", verticalAlign: "middle" }}><StatusBadge status={c.status} /></td>
                                            <td style={{ padding: "13px 16px", verticalAlign: "middle" }}><PrioridadeBadge prioridade={c.prioridade} /></td>

                                            <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                                                <div style={{ fontSize: 12, color: C.textSecondary }}>{formatDate(c.aberto_em)}</div>
                                                <div style={{ fontSize: 11, color: c.prioridade === "alta" && diasAberto(c.aberto_em) > 1 ? C.red : C.textMuted }}>
                                                    {diasAberto(c.aberto_em)}d atrás
                                                </div>
                                            </td>

                                            <td style={{ padding: "13px 16px", textAlign: "right", verticalAlign: "middle" }}>
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                                                    {/* Botão: Ver detalhes */}
                                                    <button onClick={() => setChamadoDetalhe(c)} style={{
                                                        background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                                                        padding: "5px 10px", fontSize: 12, fontWeight: 500,
                                                        color: C.textSecondary, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                                                    }}
                                                        onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent }}
                                                        onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textSecondary }}
                                                    >Ver</button>

                                                    {/* Botão: Assumir (só se aberto e sem técnico) */}
                                                    {podeAssumid && (
                                                        <button onClick={() => setChamadoAssumindo(c)} style={{
                                                            background: "rgba(96,165,250,0.1)", border: `1px solid rgba(96,165,250,0.3)`, borderRadius: 6,
                                                            padding: "5px 10px", fontSize: 12, fontWeight: 500,
                                                            color: C.accent, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                                                        }}>Assumir</button>
                                                    )}

                                                    {/* Botão: Resolver (só se em_atendimento e for meu chamado) */}
                                                    {podeResolver && (
                                                        <button onClick={() => setChamadoResolvendo(c)} style={{
                                                            background: "rgba(52,211,153,0.1)", border: `1px solid rgba(52,211,153,0.3)`, borderRadius: 6,
                                                            padding: "5px 10px", fontSize: 12, fontWeight: 600,
                                                            color: C.green, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                                                        }}>Resolver</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 22, fontSize: 11, color: C.textMuted }}>
                        TechRent · Painel do Técnico · {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            {/* Modais */}
            {chamadoDetalhe && (
                <DetalheModal chamado={chamadoDetalhe} historico={historico} onClose={() => setChamadoDetalhe(null)} />
            )}
            {chamadoAssumindo && (
                <AssumirModal chamado={chamadoAssumindo} onClose={() => setChamadoAssumindo(null)} onConfirm={handleAssumirConfirm} />
            )}
            {chamadoResolvendo && (
                <ResolverModal chamado={chamadoResolvendo} onClose={() => setChamadoResolvendo(null)} onConfirm={handleResolverConfirm} />
            )}
        </div>
    )
}