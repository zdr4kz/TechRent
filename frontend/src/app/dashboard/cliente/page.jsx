"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"

export default function Page() {

  const [chamadas, setChamadas] = useState([]) // Estado para os dados
  const [loading, setLoading] = useState(true) // Estado para o carregamento

  useEffect(() => {
    async function fetchData() {


      
      try {
        const token = localStorage.getItem("token")

        // Verifique se o backend está na 3000 ou 3001! (Ajustei para 3001 conforme o server.js)
        const response = await fetch("http://localhost:3000/chamados", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log(data.data)
          setChamadas(data.data)
        } else {
          console.error("Erro ao buscar dados da dashboard")
        }
      } catch (error) {
        console.error("Erro na requisição:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  

return (
  <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }
    }>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={chamadas} />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
);
}