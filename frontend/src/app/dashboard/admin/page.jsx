"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const [resumo, setResumo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResumo = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Não autenticado")
          setLoading(false)
          return
        }

        const response = await fetch("http://localhost:3000/dashboard/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (!response.ok) {
          throw new Error("Erro ao buscar dados do dashboard")
        }

        const data = await response.json()
        setResumo(data.data)
      } catch (err) {
        console.error("Erro:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResumo()
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      aberto: "bg-blue-100 text-blue-800",
      em_atendimento: "bg-yellow-100 text-yellow-800",
      resolvido: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
      operacional: "bg-green-100 text-green-800",
      em_manutencao: "bg-yellow-100 text-yellow-800",
      desativado: "bg-gray-100 text-gray-800"
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status) => {
    const labels = {
      aberto: "Aberto",
      em_atendimento: "Em Atendimento",
      resolvido: "Resolvido",
      cancelado: "Cancelado",
      operacional: "Operacional",
      em_manutencao: "Em Manutenção",
      desativado: "Desativado"
    }
    return labels[status] || status
  }

  const getPriorityColor = (prioridade) => {
    const colors = {
      alta: "bg-red-100 text-red-800",
      media: "bg-orange-100 text-orange-800",
      baixa: "bg-blue-100 text-blue-800"
    }
    return colors[prioridade] || "bg-gray-100 text-gray-800"
  }

  const getPriorityLabel = (prioridade) => {
    const labels = {
      alta: "Alta",
      media: "Média",
      baixa: "Baixa"
    }
    return labels[prioridade] || prioridade
  }

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" }}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-lg text-muted-foreground">Carregando dashboard...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" }}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-96 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Erro</CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">{error}</CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Calcular totais
  const totalChamados = resumo?.chamados?.reduce((sum, c) => sum + c.total, 0) || 0
  const chamadosAbertos = resumo?.chamados?.find(c => c.status === "aberto")?.total || 0
  const chamadosEmAtendimento = resumo?.chamados?.find(c => c.status === "em_atendimento")?.total || 0
  const chamadosResolvidos = resumo?.chamados?.find(c => c.status === "resolvido")?.total || 0

  const totalEquipamentos = resumo?.equipamentos?.reduce((sum, e) => sum + e.total, 0) || 0
  const equipamentosOperacionais = resumo?.equipamentos?.find(e => e.status === "operacional")?.total || 0
  const equipamentosEmManutencao = resumo?.equipamentos?.find(e => e.status === "em_manutencao")?.total || 0

  const totalUsuarios = resumo?.usuarios?.reduce((sum, u) => sum + u.total, 0) || 0
  const adminCount = resumo?.usuarios?.find(u => u.nivel_acesso === "admin")?.total || 0
  const tecnicoCount = resumo?.usuarios?.find(u => u.nivel_acesso === "tecnico")?.total || 0
  const clienteCount = resumo?.usuarios?.find(u => u.nivel_acesso === "cliente")?.total || 0

  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
            <p className="text-muted-foreground">Resumo geral do sistema TechRent</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total de Chamados */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalChamados}</div>
                <p className="text-xs text-muted-foreground">
                  {chamadosAbertos} abertos, {chamadosEmAtendimento} em andamento
                </p>
              </CardContent>
            </Card>

            {/* Equipamentos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEquipamentos}</div>
                <p className="text-xs text-muted-foreground">
                  {equipamentosOperacionais} operacionais, {equipamentosEmManutencao} em manutenção
                </p>
              </CardContent>
            </Card>

            {/* Usuários */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsuarios}</div>
                <p className="text-xs text-muted-foreground">
                  {adminCount} admin, {tecnicoCount} técnico, {clienteCount} clientes
                </p>
              </CardContent>
            </Card>

            {/* Taxa de Resolução */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalChamados > 0 ? Math.round((chamadosResolvidos / totalChamados) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {chamadosResolvidos} chamados resolvidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos e Tabelas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status dos Chamados */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Chamados</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumo?.chamados?.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <span className="text-lg font-semibold">{item.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status dos Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Equipamentos</CardTitle>
                <CardDescription>Distribuição por status operacional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumo?.equipamentos?.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <span className="text-lg font-semibold">{item.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Últimos Chamados */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Chamados Abertos</CardTitle>
              <CardDescription>5 chamados mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumo?.ultimosChamados?.length > 0 ? (
                      resumo.ultimosChamados.map((chamado) => (
                        <TableRow key={chamado.id}>
                          <TableCell className="font-medium">#{chamado.id}</TableCell>
                          <TableCell>{chamado.titulo}</TableCell>
                          <TableCell>{chamado.cliente}</TableCell>
                          <TableCell>{chamado.equipamento}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(chamado.prioridade)}>
                              {getPriorityLabel(chamado.prioridade)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(chamado.status)}>
                              {getStatusLabel(chamado.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(chamado.aberto_em).toLocaleDateString("pt-BR")}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" className="text-center py-4 text-muted-foreground">
                          Nenhum chamado encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
