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

// Crea el usuario en la DB a partir de los datos de Clerk (fallback si el webhook falló)
async function upsertUserFromClerk(clerkId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0]

  const adminEmail = process.env.ADMIN_EMAIL
  const role: UserRole = adminEmail && email === adminEmail ? "ADMIN" : "CLIENT"

  // Si ya existe un usuario con ese email (ej: del seed con clerkId distinto), actualizamos su clerkId
  const existingByEmail = await db.user.findUnique({ where: { email } })
  if (existingByEmail) {
    return db.user.update({
      where: { email },
      data: { clerkId, name, avatarUrl: clerkUser.imageUrl ?? null },
    })
  }

  // Upsert por clerkId para evitar race condition con el webhook
  return db.user.upsert({
    where: { clerkId },
    update: { email, name, avatarUrl: clerkUser.imageUrl ?? null },
    create: { clerkId, email, name, avatarUrl: clerkUser.imageUrl ?? null, role },
  })
}

// Requiere autenticación o redirige
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) redirect("/iniciar-sesion")

  let user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  // Si no está en la DB (webhook aún no sincronizó), lo creamos ahora
  if (!user) {
    user = await upsertUserFromClerk(userId)
    if (!user) redirect("/iniciar-sesion")
  }

  // Auto-promover a ADMIN si el email coincide con ADMIN_EMAIL (útil cuando
  // se configura ADMIN_EMAIL después de que el usuario ya fue creado como CLIENT)
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email === adminEmail && user.role !== "ADMIN") {
    user = await db.user.update({
      where: { clerkId: userId },
      data: { role: "ADMIN" },
    })
  }

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
