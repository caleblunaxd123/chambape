import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import SeleccionarTipoForm from "./SeleccionarTipoForm"

export const metadata = { title: "¿Cómo usarás ChambaPe?" }

export default async function SeleccionarTipoPage() {
  const { userId } = await auth()

  // Sin sesión activa → login
  if (!userId) redirect("/iniciar-sesion")

  // Verificar si el usuario ya tiene un rol asignado en la BD
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  // Si ya completó el flujo, redirigir a su panel correspondiente
  // (evita que vuelva y cambie su rol por accidente)
  if (user?.role === "PROFESSIONAL") redirect("/profesional/dashboard")
  if (user?.role === "ADMIN") redirect("/admin/dashboard")
  // CLIENT es el rol por defecto — se muestra la página normalmente
  // para que puedan confirmar o cambiarse a PROFESSIONAL

  return <SeleccionarTipoForm />
}
