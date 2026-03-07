// Webhook de Clerk → sincroniza usuarios a nuestra BD
// Configurar en: Clerk Dashboard > Webhooks > Add Endpoint
// URL: https://tu-dominio.com/api/webhooks/clerk
// Eventos: user.created, user.updated, user.deleted

import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

interface ClerkUserEvent {
  type: "user.created" | "user.updated" | "user.deleted"
  data: {
    id: string
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string
    phone_numbers: Array<{ phone_number: string; id: string }>
    primary_phone_number_id: string | null
    public_metadata: { role?: UserRole }
  }
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret no configurado", { status: 500 })
  }

  // Verificar la firma del webhook (seguridad)
  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Faltan headers de Svix", { status: 400 })
  }

  const payload = await req.text()

  let event: ClerkUserEvent
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new NextResponse("Firma inválida", { status: 400 })
  }

  const { type, data } = event

  // Email principal del usuario
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address

  if (!primaryEmail) {
    return new NextResponse("Sin email principal", { status: 400 })
  }

  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "Usuario"
  const phone = data.phone_numbers.find(
    (p) => p.id === data.primary_phone_number_id
  )?.phone_number

  // Determinar rol: admin si coincide con ADMIN_EMAIL
  const isAdminEmail = primaryEmail === process.env.ADMIN_EMAIL
  const role: UserRole = data.public_metadata?.role ?? (isAdminEmail ? "ADMIN" : "CLIENT")

  try {
    if (type === "user.created") {
      await db.user.create({
        data: {
          clerkId: data.id,
          email: primaryEmail,
          name,
          phone,
          avatarUrl: data.image_url,
          role,
        },
      })
    } else if (type === "user.updated") {
      await db.user.update({
        where: { clerkId: data.id },
        data: {
          email: primaryEmail,
          name,
          phone,
          avatarUrl: data.image_url,
        },
      })
    } else if (type === "user.deleted") {
      await db.user.update({
        where: { clerkId: data.id },
        data: { active: false },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[CLERK_WEBHOOK]", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}
