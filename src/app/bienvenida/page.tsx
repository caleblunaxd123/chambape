import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import BienvenidaClient from "./BienvenidaClient"

export const metadata: Metadata = {
  title: "¡Bienvenido a ChambaPe!",
  robots: { index: false }, // No indexar esta página en Google
}

interface Props {
  searchParams: Promise<{ tipo?: string }>
}

export default async function BienvenidaPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/iniciar-sesion")

  const { tipo } = await searchParams
  const tipoValido = tipo === "profesional" ? "profesional" : "cliente"

  return <BienvenidaClient tipo={tipoValido} />
}
