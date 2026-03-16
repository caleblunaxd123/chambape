/**
 * reset-test-data.ts
 * Limpia todos los datos de prueba de la BD Y de Clerk, preservando:
 *  - Usuarios con rol ADMIN (en DB y Clerk)
 *  - ServiceCategory y ServiceSubcategory
 *  - CreditPackage
 *  - SubscriptionPlan
 *  - Badge
 *
 * Ejecutar con:  npx tsx scripts/reset-test-data.ts
 */

import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

// Cargar .env.local
const envPath = path.resolve(__dirname, "../.env.local")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const db = new PrismaClient()

// ─── Helper para llamar la API REST de Clerk ────────────────────────────────
async function clerkRequest(method: string, endpoint: string, body?: object) {
  const res = await fetch(`https://api.clerk.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Clerk API ${method} ${endpoint} → ${res.status}: ${txt}`)
  }
  return res.status === 204 ? null : res.json()
}

// ─── Obtener TODOS los usuarios de Clerk (paginado) ─────────────────────────
async function getAllClerkUsers(): Promise<Array<{ id: string; email: string }>> {
  const all: Array<{ id: string; email: string }> = []
  let offset = 0
  const limit = 100

  while (true) {
    const users = await clerkRequest("GET", `/users?limit=${limit}&offset=${offset}`) as any[]
    if (!users || users.length === 0) break

    for (const u of users) {
      all.push({
        id: u.id,
        email: u.email_addresses?.[0]?.email_address ?? "(sin email)",
      })
    }

    if (users.length < limit) break
    offset += limit
  }

  return all
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌  CLERK_SECRET_KEY no encontrada en .env.local")
    process.exit(1)
  }

  console.log("🧹  Iniciando limpieza de datos de prueba...\n")

  // ── 1. Obtener clerkIds de ADMINS para protegerlos ───────────────────────────
  const adminUsers = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { clerkId: true, email: true },
  })
  const adminClerkIds = new Set(adminUsers.map((u) => u.clerkId))
  console.log(`🔒  Admins protegidos: ${adminUsers.length} (${adminUsers.map(u => u.email).join(", ")})`)

  // ── 2. Limpiar tablas DB (orden FK) ────────────────────────────────────────
  console.log("\n🗃️   Limpiando base de datos...")
  const steps: Array<[string, () => Promise<{ count: number }>]> = [
    ["Message",                  () => db.message.deleteMany({})],
    ["Conversation",             () => db.conversation.deleteMany({})],
    ["Notification",             () => db.notification.deleteMany({})],
    ["Review",                   () => db.review.deleteMany({})],
    ["ServiceApplication",       () => db.serviceApplication.deleteMany({})],
    ["ServiceRequest",           () => db.serviceRequest.deleteMany({})],
    ["CreditTransaction",        () => db.creditTransaction.deleteMany({})],
    ["ProfessionalSubscription", () => (db as any).professionalSubscription.deleteMany({})],
    ["Favorite",                 () => db.favorite.deleteMany({})],
    ["PortfolioImage",           () => db.portfolioImage.deleteMany({})],
    ["ProfessionalDocument",     () => (db as any).professionalDocument.deleteMany({})],
    ["WorkExperience",           () => db.workExperience.deleteMany({})],
    ["ProfessionalCategory",     () => db.professionalCategory.deleteMany({})],
    ["ProfessionalBadge",        () => db.professionalBadge.deleteMany({})],
    ["ProfessionalProfile",      () => db.professionalProfile.deleteMany({})],
    ["User (no-admin)",          () => db.user.deleteMany({ where: { role: { not: "ADMIN" } } })],
  ]

  for (const [name, fn] of steps) {
    const result = await fn()
    const pad = " ".repeat(Math.max(0, 28 - name.length))
    console.log(`  ✅  ${name}${pad}→ ${result.count} eliminados`)
  }

  // ── 3. Borrar TODOS los usuarios no-admin en Clerk ──────────────────────────
  // Incluye usuarios "fantasma" que nunca se sincronizaron a la DB (webhook fallido)
  console.log("\n🔑  Obteniendo todos los usuarios de Clerk...")

  let clerkUsers: Array<{ id: string; email: string }> = []
  try {
    clerkUsers = await getAllClerkUsers()
  } catch (err: any) {
    console.error("  ❌  No se pudo obtener la lista de usuarios de Clerk:", err.message)
    process.exit(1)
  }

  const toDelete = clerkUsers.filter((u) => !adminClerkIds.has(u.id))
  const toKeep   = clerkUsers.filter((u) => adminClerkIds.has(u.id))

  console.log(`  📊  Total en Clerk: ${clerkUsers.length} | A eliminar: ${toDelete.length} | A conservar: ${toKeep.length}`)

  if (toDelete.length === 0) {
    console.log("  ℹ️   No hay usuarios no-admin en Clerk para eliminar.")
  } else {
    let clerkOk = 0
    let clerkFail = 0

    for (const u of toDelete) {
      try {
        await clerkRequest("DELETE", `/users/${u.id}`)
        console.log(`  ✅  Clerk: ${u.email} (${u.id}) eliminado`)
        clerkOk++
      } catch (err: any) {
        // 404 = ya no existía, igual lo contamos como OK
        if (err.message?.includes("404")) {
          console.log(`  ⚠️   Clerk: ${u.email} ya no existía (404)`)
          clerkOk++
        } else {
          console.error(`  ❌  Clerk: ${u.email} → ${err.message}`)
          clerkFail++
        }
      }
    }

    console.log(`\n  Clerk: ${clerkOk} eliminados, ${clerkFail} errores`)
  }

  // ── 4. Resumen ───────────────────────────────────────────────────────────────
  const adminCount = await db.user.count({ where: { role: "ADMIN" } })
  const catCount   = await db.serviceCategory.count()
  const pkgCount   = await db.creditPackage.count()
  const planCount  = await (db as any).subscriptionPlan.count()

  console.log("\n🎉  Limpieza completada!")
  console.log("────────────────────────────────")
  console.log("🔒  Conservados:")
  console.log(`    Admin users      : ${adminCount}`)
  console.log(`    ServiceCategory  : ${catCount}`)
  console.log(`    CreditPackage    : ${pkgCount}`)
  console.log(`    SubscriptionPlan : ${planCount}`)
  console.log("────────────────────────────────")
  console.log("✅  La BD y Clerk están listos para pruebas limpias.")
}

main()
  .catch((e) => {
    console.error("❌  Error durante la limpieza:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
