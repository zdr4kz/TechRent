"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { jwtDecode } from "jwt-decode"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, ...props }) {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      // Ajustado para a porta 3001 conforme seu server.js
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()

      if (response.ok) {
        alert(result.mensagem)
        localStorage.setItem("token", result.token)

        const nivel = jwtDecode(result.token).nivel_acesso

        window.location.href = `/dashboard/${nivel}`
      } else {
        alert(result.mensagem || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
      alert("Não foi possível conectar ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
             <CardTitle className={"flex justify-center text-[25px] mb-5"}>TechRent</CardTitle>
          <CardTitle>Acesse sua conta</CardTitle>
          <CardDescription>
            Insira seu e-mail abaixo para entrar no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  name="senha" // Mantido 'senha' para casar com seu req.body no backend
                  type="password"
                  required
                />
              </Field>
              <Field className="grid gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <FieldDescription className="text-center text-sm">
                  Não tem uma conta? <a href="/signup" className="underline">Cadastre-se</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}