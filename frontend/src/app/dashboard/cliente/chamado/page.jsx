"use client"

import { useState, useEffect } from "react"

// =============================================
// DARK DASHBOARD — shadcn/ui inspired
// =============================================

const STATUS_CONFIG = {
    aberto: { label: "Aberto", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", dot: "#F59E0B", border: "rgba(245,158,11,0.3)" },
    em_atendimento: { label: "Em Atendimento", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", dot: "#60A5FA", border: "rgba(96,165,250,0.3)" },
    resolvido: { label: "Resolvido", color: "#34D399", bg: "rgba(52,211,153,0.12)", dot: "#34D399", border: "rgba(52,211,153,0.3)" },
    cancelado: { label: "Cancelado", color: "#F87171", bg: "rgba(248,113,113,0.12)", dot: "#F87171", border: "rgba(248,113,113,0.3)" },
}

const PRIORIDADE_CONFIG = {
    baixa: { label: "Baixa", color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
    media: { label: "Média", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
    alta: { label: "Alta", color: "#F87171", bg: "rgba(248,113,113,0.1)" },
}

const MOCK_CHAMADOS = [
    { id: 1, titulo: "Notebook não liga", status: "resolvido", prioridade: "alta", equipamento: "Laptop Dell XPS", equipamento_categoria: "Notebook", tecnico: "Carlos Silva", abertura: "2025-07-01T09:00:00", atualizado: "2025-07-03T14:30:00" },
    { id: 2, titulo: "Projetor sem sinal HDMI", status: "em_atendimento", prioridade: "media", equipamento: "Projetor Epson X41", equipamento_categoria: "Projetor", tecnico: "Ana Costa", abertura: "2025-07-05T11:20:00", atualizado: "2025-07-06T08:10:00" },
    { id: 3, titulo: "Teclado com teclas travadas", status: "aberto", prioridade: "baixa", equipamento: "Teclado Mecânico", equipamento_categoria: "Periférico", tecnico: null, abertura: "2025-07-07T15:45:00", atualizado: "2025-07-07T15:45:00" },
    { id: 4, titulo: "Monitor piscando", status: "aberto", prioridade: "media", equipamento: "Monitor LG 24''", equipamento_categoria: "Monitor", tecnico: null, abertura: "2025-07-08T09:30:00", atualizado: "2025-07-08T09:30:00" },
    { id: 5, titulo: "HD externo não reconhecido", status: "cancelado", prioridade: "baixa", equipamento: "HD Externo 1TB", equipamento_categoria: "Armazenamento", tecnico: "Carlos Silva", abertura: "2025-07-02T13:00:00", atualizado: "2025-07-04T16:00:00" },
    { id: 6, titulo: "Impressora offline", status: "em_atendimento", prioridade: "alta", equipamento: "Impressora HP", equipamento_categoria: "Impressora", tecnico: "Ana Costa", abertura: "2025-07-08T07:00:00", atualizado: "2025-07-08T10:00:00" },
]

const MOCK_EQUIPAMENTOS = [
    { id: 1, nome: "Laptop Dell XPS", categoria: "Notebook" },
    { id: 2, nome: "Projetor Epson X41", categoria: "Projetor" },
    { id: 3, nome: "Teclado Mecânico", categoria: "Periférico" },
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

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: C.textSecondary, bg: C.card, dot: C.textMuted, border: C.border }
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 6,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontSize: 11, fontWeight: 500, letterSpacing: 0.2, whiteSpace: "nowrap",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {cfg.label}
        </span>
    )
}

function PrioridadeBadge({ prioridade }) {
    const cfg = PRIORIDADE_CONFIG[prioridade] || { label: prioridade, color: C.textSecondary, bg: C.card }
    return (
        <span style={{
            fontSize: 11, fontWeight: 500, color: cfg.color,
            background: cfg.bg, padding: "2px 8px",
            borderRadius: 4, letterSpacing: 0.3,
        }}>
            {cfg.label}
        </span>
    )
}

function StatCard({ icon, label, value, color, sublabel, active, onClick, trend }) {
    return (
        <div onClick={onClick} style={{
            background: active ? `rgba(${hexToRgb(color)},0.07)` : C.card,
            border: `1px solid ${active ? color + "50" : C.border}`,
            borderRadius: 12, padding: "20px 22px",
            cursor: onClick ? "pointer" : "default",
            transition: "all 0.15s",
            position: "relative", overflow: "hidden",
        }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.borderHover }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border }}
        >
            {active && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: color,
                }} />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
                <div style={{
                    padding: "5px 8px", borderRadius: 6,
                    background: `rgba(${hexToRgb(color)},0.1)`, color: color, fontSize: 12,
                }}>{icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: active ? color : C.textPrimary, lineHeight: 1, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            {sublabel && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sublabel}</div>}
        </div>
    )
}

function hexToRgb(hex) {
    if (!hex || !hex.startsWith("#")) return "255,255,255"
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

function Divider() {
    return <div style={{ height: 1, background: C.border, margin: "0 -32px" }} />
}

function DetalheModal({ chamado, onClose }) {
    if (!chamado) return null
    const cfg = STATUS_CONFIG[chamado.status] || {}
    const mensagemStatus = {
        aberto: "Seu chamado foi recebido e está aguardando atribuição de técnico.",
        em_atendimento: `Em atendimento por ${chamado.tecnico}. Você será notificado ao concluir.`,
        resolvido: "Chamado resolvido com sucesso.",
        cancelado: "Este chamado foi cancelado.",
    }

    const rows = [
        ["Status", <StatusBadge status={chamado.status} />],
        ["Prioridade", <PrioridadeBadge prioridade={chamado.prioridade} />],
        ["Equipamento", chamado.equipamento],
        ["Categoria", chamado.equipamento_categoria || "—"],
        ["Técnico", chamado.tecnico || <span style={{ color: C.textMuted }}>Não atribuído</span>],
        ["Aberto em", formatDateTime(chamado.abertura)],
        ["Última atualização", formatDateTime(chamado.atualizado)],
        ["Dias em aberto", `${diasAberto(chamado.abertura)} dias`],
    ]

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            backdropFilter: "blur(4px)",
        }} onClick={onClose}>
            <div style={{
                background: C.card, borderRadius: 14, padding: 28, maxWidth: 520, width: "100%",
                border: `1px solid ${C.border}`,
                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                    <div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Chamado #{chamado.id}</div>
                        <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary }}>{chamado.titulo}</div>
                    </div>
                    <button onClick={onClose} style={{
                        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
                        width: 30, height: 30, cursor: "pointer", fontSize: 14, color: C.textSecondary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>

                <Divider />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "18px 0" }}>
                    {rows.map(([k, v]) => (
                        <div key={k} style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>{k}</div>
                            <div style={{ fontSize: 13, color: C.textSecondary }}>{v}</div>
                        </div>
                    ))}
                </div>

                {chamado.descricao && (
                    <div style={{ background: C.surface, borderRadius: 8, padding: "12px 14px", marginBottom: 14, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Descrição</div>
                        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{chamado.descricao}</div>
                    </div>
                )}

                <div style={{
                    background: cfg.bg || C.surface,
                    border: `1px solid ${cfg.border || C.border}`,
                    borderRadius: 8, padding: "11px 14px",
                    fontSize: 13, color: C.textSecondary, lineHeight: 1.5,
                }}>
                    {mensagemStatus[chamado.status] || "Status desconhecido."}
                </div>
            </div>
        </div>
    )
}

function NovoChamadoModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({ titulo: "", descricao: "", equipamento_id: "", prioridade: "media" })
    const [equipamentos, setEquipamentos] = useState([])
    const [loadingEq, setLoadingEq] = useState(true)
    const [enviando, setEnviando] = useState(false)

    // Busca equipamentos operacionais do backend ao abrir o modal
    useEffect(() => {
        async function fetchEquipamentos() {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch("http://localhost:3000/equipamentos", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const json = await res.json()
                    // suporta { data: [...] } ou array direto
                    const lista = json.data ?? json ?? []
                    setEquipamentos(Array.isArray(lista) ? lista : [])
                } else {
                    console.error("Erro ao buscar equipamentos:", res.status)
                    setEquipamentos(MOCK_EQUIPAMENTOS)
                }
            } catch (e) {
                console.error("Falha ao buscar equipamentos:", e)
                setEquipamentos(MOCK_EQUIPAMENTOS)
            } finally {
                setLoadingEq(false)
            }
        }
        fetchEquipamentos()
    }, [])

    async function handleSubmit() {
        if (!form.titulo || !form.equipamento_id) return
        setEnviando(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:3000/chamados", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    equipamento_id: Number(form.equipamento_id), // garante número no body
                }),
            })
            const result = await res.json() // lê UMA vez

            console.log(result)

            if (result.sucesso === false) {
                alert(result.mensagem)
                setEnviando(false)
                return
            }

            const nomeEq = equipamentos.find(e => String(e.id) === String(form.equipamento_id))?.nome
            onSubmit({
                ...form,
                id: result.data?.id,
                equipamento: nomeEq || `Equipamento #${form.equipamento_id}`,
                status: "aberto",
                abertura: new Date().toISOString(),
                atualizado: new Date().toISOString(),
            })
        } catch (e) {
            console.error("Erro ao criar chamado:", e)
            const nomeEq = equipamentos.find(e => String(e.id) === String(form.equipamento_id))?.nome
            onSubmit({
                ...form,
                equipamento: nomeEq || `Equipamento #${form.equipamento_id}`,
                status: "aberto",
                abertura: new Date().toISOString(),
                atualizado: new Date().toISOString(),
            })
        } finally {
            setEnviando(false)
            onClose()
        }
    }

    const inputStyle = {
        width: "100%", padding: "9px 12px", borderRadius: 8, boxSizing: "border-box",
        border: `1px solid ${C.border}`, fontSize: 13, color: C.textPrimary,
        fontFamily: "inherit", outline: "none", background: C.surface,
        transition: "border-color 0.15s",
    }

    const labelStyle = { fontSize: 12, fontWeight: 500, color: C.textSecondary, display: "block", marginBottom: 6 }

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            backdropFilter: "blur(4px)",
        }} onClick={onClose}>
            <div style={{
                background: C.card, borderRadius: 14, padding: 28, maxWidth: 480, width: "100%",
                border: `1px solid ${C.border}`,
                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }} onClick={e => e.stopPropagation()}>

                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>Abrir Chamado</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>Descreva o problema e selecione o equipamento</div>
                </div>

                <Divider />

                <div style={{ marginTop: 18 }}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Título <span style={{ color: "#F87171" }}>*</span></label>
                        <input type="text" placeholder="Ex: Monitor piscando" value={form.titulo}
                            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = C.accent}
                            onBlur={e => e.target.style.borderColor = C.border}
                        />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea placeholder="Descreva o problema com mais detalhes..." value={form.descricao}
                            onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={3}
                            style={{ ...inputStyle, resize: "none" }}
                            onFocus={e => e.target.style.borderColor = C.accent}
                            onBlur={e => e.target.style.borderColor = C.border}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                        <div>
                            <label style={labelStyle}>Equipamento <span style={{ color: "#F87171" }}>*</span></label>
                            <select
                                value={form.equipamento_id}
                                onChange={e => setForm(p => ({ ...p, equipamento_id: e.target.value }))}
                                disabled={loadingEq}
                                style={{ ...inputStyle, opacity: loadingEq ? 0.5 : 1, cursor: loadingEq ? "not-allowed" : "auto" }}
                            >
                                <option value="">{loadingEq ? "Carregando..." : "Selecionar..."}</option>
                                {equipamentos.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nome}{eq.categoria ? ` (${eq.categoria})` : ""}
                                    </option>
                                ))}
                            </select>
                            {!loadingEq && equipamentos.length === 0 && (
                                <div style={{ fontSize: 11, color: "#F87171", marginTop: 4 }}>
                                    Nenhum equipamento disponível
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Prioridade</label>
                            <select value={form.prioridade} onChange={e => setForm(p => ({ ...p, prioridade: e.target.value }))} style={inputStyle}>
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{
                            flex: 1, padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                            background: "transparent", color: C.textSecondary, fontWeight: 500, cursor: "pointer", fontSize: 13,
                            fontFamily: "inherit",
                        }}>Cancelar</button>
                        <button onClick={handleSubmit} disabled={enviando || !form.titulo || !form.equipamento_id} style={{
                            flex: 2, padding: "9px 16px", borderRadius: 8, border: "none",
                            background: (!form.titulo || !form.equipamento_id) ? C.borderHover : C.accent,
                            color: (!form.titulo || !form.equipamento_id) ? C.textMuted : "#fff",
                            fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                            transition: "all 0.15s",
                        }}>
                            {enviando ? "Enviando..." : "Abrir Chamado"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// =============================================
// SIDEBAR
// =============================================
function Sidebar() {
    const navItems = [
        { label: "Dashboard", icon: "▣", active: true },
        { label: "Chamados", icon: "≡", active: false },
        { label: "Equipamentos", icon: "◫", active: false },
        { label: "Relatórios", icon: "⊟", active: false },
        { label: "Configurações", icon: "◎", active: false },
    ]
    return (
        <div style={{
            width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
            height: "100vh", position: "sticky", top: 0, flexShrink: 0,
            display: "flex", flexDirection: "column",
        }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.2 }}>TechRent</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Central de Chamados</div>
            </div>

            <nav style={{ padding: "10px 10px", flex: 1 }}>
                {navItems.map(item => (
                    <div key={item.label} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 7, marginBottom: 2,
                        background: item.active ? C.accentDim : "transparent",
                        color: item.active ? C.accent : C.textMuted,
                        fontSize: 13, fontWeight: item.active ? 500 : 400,
                        cursor: "pointer", transition: "all 0.12s",
                    }}>
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div style={{ padding: "14px 14px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: "50%", background: C.accentDim,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: C.accent, flexShrink: 0,
                    }}>CL</div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>Cliente</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>cliente@empresa.com</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function DashboardChamadosCliente() {
    const [chamados, setChamados] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroStatus, setFiltroStatus] = useState("todos")
    const [busca, setBusca] = useState("")
    const [chamadoSelecionado, setChamadoSelecionado] = useState(null)
    const [mostrarNovo, setMostrarNovo] = useState(false)
    const [usandoMock, setUsandoMock] = useState(false)

    useEffect(() => {
        async function fetchChamados() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                const res = await fetch("http://localhost:3000/chamados", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const json = await res.json()
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
        fetchChamados()
    }, [])

    const total = chamados.length
    const abertos = chamados.filter(c => c.status === "aberto").length
    const emAtendimento = chamados.filter(c => c.status === "em_atendimento").length
    const resolvidos = chamados.filter(c => c.status === "resolvido").length
    const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0

    const chamadosFiltrados = chamados.filter(c => {
        const matchStatus = filtroStatus === "todos" || c.status === filtroStatus
        const matchBusca = !busca
            || c.titulo?.toLowerCase().includes(busca.toLowerCase())
            || c.equipamento?.toLowerCase().includes(busca.toLowerCase())
        return matchStatus && matchBusca
    })

    function handleNovoChamado(form) {
        const eqSelecionado = form.equipamento_id
        setChamados(prev => [{
            id: prev.length + 1,
            titulo: form.titulo,
            descricao: form.descricao,
            status: "aberto",
            prioridade: form.prioridade,
            equipamento: `Equipamento #${eqSelecionado}`,
            equipamento_categoria: "",
            tecnico: null,
            abertura: form.abertura,
            atualizado: form.atualizado,
        }, ...prev])
    }

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                <div style={{ color: C.textMuted, fontSize: 13 }}>Carregando chamados...</div>
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

            <Sidebar />

            <div style={{ flex: 1, overflow: "auto" }}>
                {/* Top bar */}
                <div style={{
                    background: C.surface, borderBottom: `1px solid ${C.border}`,
                    padding: "0 28px", height: 56,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 100,
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Meus Chamados</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Acompanhe o status das suas solicitações</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => setMostrarNovo(true)} style={{
                            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
                            padding: "7px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                        }}>
                            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>Novo Chamado
                        </button>
                    </div>
                </div>

                <div style={{ padding: "24px 28px" }}>

                    {/* Stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
                        <StatCard icon="≡" label="Total" value={total} color="#60A5FA" sublabel="Todos os chamados" active={filtroStatus === "todos"} onClick={() => setFiltroStatus("todos")} />
                        <StatCard icon="◌" label="Abertos" value={abertos} color="#F59E0B" sublabel="Aguardando atendimento" active={filtroStatus === "aberto"} onClick={() => setFiltroStatus("aberto")} />
                        <StatCard icon="◎" label="Em atendimento" value={emAtendimento} color="#60A5FA" sublabel="Técnico alocado" active={filtroStatus === "em_atendimento"} onClick={() => setFiltroStatus("em_atendimento")} />
                        <StatCard icon="◉" label="Resolvidos" value={resolvidos} color="#34D399" sublabel={`${taxaResolucao}% de resolução`} active={filtroStatus === "resolvido"} onClick={() => setFiltroStatus("resolvido")} />
                    </div>

                    {/* Filters + search */}
                    <div style={{
                        display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap",
                    }}>
                        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 140 }}>
                            <span style={{
                                position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                                fontSize: 13, color: C.textMuted, pointerEvents: "none",
                            }}>⊘</span>
                            <input
                                placeholder="Buscar chamado ou equipamento..."
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
                                { key: "todos", label: "Todos", count: total, color: C.textSecondary },
                                { key: "aberto", label: "Abertos", count: abertos, color: "#F59E0B" },
                                { key: "em_atendimento", label: "Em atendimento", count: emAtendimento, color: "#60A5FA" },
                                { key: "resolvido", label: "Resolvidos", count: resolvidos, color: "#34D399" },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFiltroStatus(f.key)} style={{
                                    padding: "6px 12px", borderRadius: 7,
                                    border: `1px solid ${filtroStatus === f.key ? f.color + "50" : C.border}`,
                                    background: filtroStatus === f.key ? `rgba(${hexToRgb(f.color)},0.1)` : "transparent",
                                    color: filtroStatus === f.key ? f.color : C.textMuted,
                                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.12s",
                                }}>
                                    {f.label}
                                    <span style={{
                                        background: filtroStatus === f.key ? `rgba(${hexToRgb(f.color)},0.2)` : C.surface,
                                        color: filtroStatus === f.key ? f.color : C.textMuted,
                                        borderRadius: 4, padding: "0 5px", fontSize: 11, fontWeight: 600,
                                        minWidth: 20, textAlign: "center",
                                    }}>{f.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{
                        background: C.card, borderRadius: 12, overflow: "hidden",
                        border: `1px solid ${C.border}`,
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, width: 52 }}>#</th>
                                    <th style={thStyle}>Título / Equipamento</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Prioridade</th>
                                    <th style={thStyle}>Técnico</th>
                                    <th style={thStyle}>Aberto em</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chamadosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: "52px 24px", textAlign: "center", color: C.textMuted }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Nenhum chamado encontrado</div>
                                            <div style={{ fontSize: 12 }}>
                                                {busca ? "Tente outros termos de busca." : "Abra um novo chamado para começar."}
                                            </div>
                                        </td>
                                    </tr>
                                ) : chamadosFiltrados.map((c, i) => (
                                    <tr key={c.id} style={{ borderBottom: i < chamadosFiltrados.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.1s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = C.surface}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "13px 16px", fontSize: 12, fontWeight: 500, color: C.textMuted, verticalAlign: "middle" }}>#{c.id}</td>
                                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 2 }}>{c.titulo}</div>
                                            <div style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                                                {c.equipamento}
                                                {c.equipamento_categoria && (
                                                    <span style={{
                                                        background: C.surface, padding: "1px 6px", borderRadius: 4,
                                                        fontSize: 10, color: C.textMuted, border: `1px solid ${C.border}`,
                                                    }}>{c.equipamento_categoria}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}><StatusBadge status={c.status} /></td>
                                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}><PrioridadeBadge prioridade={c.prioridade} /></td>
                                        <td style={{ padding: "13px 16px", fontSize: 13, color: c.tecnico ? C.textSecondary : C.textMuted, verticalAlign: "middle" }}>
                                            {c.tecnico || "—"}
                                        </td>
                                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                                            <div style={{ fontSize: 12, color: C.textSecondary }}>{formatDate(c.abertura)}</div>
                                            <div style={{ fontSize: 11, color: C.textMuted }}>{diasAberto(c.abertura)}d atrás</div>
                                        </td>
                                        <td style={{ padding: "13px 16px", textAlign: "right", verticalAlign: "middle" }}>
                                            <button onClick={() => setChamadoSelecionado(c)} style={{
                                                background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                                                padding: "5px 12px", fontSize: 12, fontWeight: 500,
                                                color: C.textSecondary, cursor: "pointer", fontFamily: "inherit",
                                                transition: "all 0.12s",
                                            }}
                                                onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent }}
                                                onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textSecondary }}
                                            >
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 22, fontSize: 11, color: C.textMuted }}>
                        TechRent · Central de Chamados · {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            {chamadoSelecionado && <DetalheModal chamado={chamadoSelecionado} onClose={() => setChamadoSelecionado(null)} />}
            {mostrarNovo && <NovoChamadoModal onClose={() => setMostrarNovo(false)} onSubmit={handleNovoChamado} />}
        </div>
    )
}