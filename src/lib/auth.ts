import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

// Obtiene el usuario de la DB sincronizado con Clerk
export async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { professionalProfile: true },
  })

  return user
}

// Requiere autenticación o redirige
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) redirect("/iniciar-sesion")

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) redirect("/iniciar-sesion")
  return user
}

// Requiere rol específico
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) redirect("/")
  return user
}

// Requiere ser profesional
export async function requireProfessional() {
  const user = await requireAuth()
  if (user.role !== "PROFESSIONAL") redirect("/")

  const profile = await db.professionalProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) redirect("/registrarse/profesional")
  return { user, profile }
}

// Requiere ser admin
export async function requireAdmin() {
  return requireRole("ADMIN")
}

// Helpers para verificar roles en Server Components
export async function isAdmin(): Promise<boolean> {
  const user = await getDbUser()
  return user?.role === "ADMIN"
}

export async function isProfessional(): Promise<boolean> {
  const user = await getDbUser()
  return user?.role === "PROFESSIONAL"
}
