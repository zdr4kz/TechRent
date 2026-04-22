"use client"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
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

export function SignupForm({...props}) 
{
  const [loading, setLoading] = useState(false)

  const handleSignup = async (event) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

        try {
          // Ajustado para a porta 3001 conforme seu server.js
          const response = await fetch("http://localhost:3000/auth/registro", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          })
          const result = await response.json()
    
          if (response.ok) {
            alert(result.mensagem)
            window.location.href = `/login`
          } else {
            alert(result.mensagem )
          }
        } catch (error) {
          console.error("Erro na requisição:", error)
          alert("Não foi possível conectar ao servidor.")
        } finally {
          setLoading(false)
        }
      }



  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className={"flex justify-center text-[25px] mb-5"}>TechRent</CardTitle>
        <CardTitle>Criar uma conta</CardTitle>
        <CardDescription>
          Insira suas informações abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
              <Input id="name" name="nome" type="text" placeholder="João Silva" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="exemplo@email.com" required />
              <FieldDescription>
                Usaremos isso para contatá-lo. Não compartilharemos seu e-mail
                com mais ninguém.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input id="password" name="senha" type="password" required />
              <FieldDescription>
                Deve ter pelo menos 8 caracteres.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar Senha
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Por favor, confirme sua senha.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Criar Conta</Button>
                <FieldDescription className="px-6 text-center">
                  Já tem uma conta? <a href="/login">Entrar</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
