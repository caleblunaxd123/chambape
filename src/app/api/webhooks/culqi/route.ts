// POST /api/webhooks/culqi
// Webhook de confirmación de pagos Culqi
// Actúa como red de seguridad: si el checkout falló antes de guardar en DB,
// este webhook lo recupera. Usa culqiChargeId para garantizar idempotencia.

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

// Culqi envía el webhook con un header "Authorization: Bearer <CULQI_WEBHOOK_SECRET>"
// Configura este valor en tu panel Culqi → Desarrollo → Webhooks → Activar autenticación
const WEBHOOK_SECRET = process.env.CULQI_WEBHOOK_SECRET

export async function POST(req: Request) {
  // ─── Verificar autenticación ─────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? ""
  const token = authHeader.replace("Bearer ", "").trim()

  if (WEBHOOK_SECRET && token !== WEBHOOK_SECRET) {
    console.warn("[CULQI_WEBHOOK] Token inválido:", token)
    return new NextResponse("No autorizado", { status: 401 })
  }

  let payload: CulqiWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new NextResponse("Payload inválido", { status: 400 })
  }

  console.log("[CULQI_WEBHOOK] Evento recibido:", payload.type, payload.data?.object?.id)

  // Solo procesar cargos exitosos (Culqi usa ambos nombres según versión)
  if (payload.type !== "charge.creation.success" && payload.type !== "charge.creation.succeeded") {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const charge = payload.data?.object
  if (!charge?.id || charge.object !== "charge") {
    return NextResponse.json({ error: "Payload de cargo inválido" }, { status: 400 })
  }

  const chargeId: string = charge.id
  const metadata = charge.metadata as Record<string, string> | undefined

  if (!metadata?.professionalId || !metadata?.packageId) {
    console.warn("[CULQI_WEBHOOK] Sin metadata, ignorando:", chargeId)
    return NextResponse.json({ ok: true, ignored: true })
  }

  // ─── Idempotencia: ya fue procesado por checkout síncrono ───────
  const existing = await db.creditTransaction.findFirst({
    where: { culqiChargeId: chargeId },
  })

  if (existing) {
    console.log("[CULQI_WEBHOOK] Cargo ya procesado:", chargeId)
    return NextResponse.json({ ok: true, already_processed: true })
  }

  // ─── No fue procesado (checkout falló): acreditar ahora ─────────
  const prof = await db.professionalProfile.findUnique({
    where: { id: metadata.professionalId },
    include: { user: true },
  })

  if (!prof) {
    console.error("[CULQI_WEBHOOK] Profesional no encontrado:", metadata.professionalId)
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
  }

  const pkg = await db.creditPackage.findUnique({ where: { id: metadata.packageId } })
  if (!pkg) {
    console.error("[CULQI_WEBHOOK] Paquete no encontrado:", metadata.packageId)
    return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
  }

  const [updatedProfile] = await db.$transaction([
    db.professionalProfile.update({
      where: { id: prof.id },
      data: { credits: { increment: pkg.credits } },
    }),
    db.creditTransaction.create({
      data: {
        professionalId: prof.id,
        type: "PURCHASE",
        credits: pkg.credits,
        amountPen: charge.amount,
        balance: prof.credits + pkg.credits,
        description: `Compra recuperada vía webhook: ${pkg.name} (${pkg.credits} créditos)`,
        culqiChargeId: chargeId,
      },
    }),
  ])

  // Notificar al profesional
  createNotification({
    userId: prof.userId,
    type: "CREDITS_PURCHASED",
    title: "¡Créditos acreditados!",
    message: `Se acreditaron ${pkg.credits} créditos a tu cuenta. Saldo actual: ${updatedProfile.credits}.`,
    link: "/profesional/creditos",
  }).catch(() => {})

  console.log("[CULQI_WEBHOOK] Créditos acreditados vía webhook:", chargeId, pkg.credits)
  return NextResponse.json({ ok: true, credits: pkg.credits, newBalance: updatedProfile.credits })
}

// ─── Tipos del payload de Culqi ──────────────────────────────────────────────
interface CulqiWebhookPayload {
  type: string
  data: {
    object: {
      id: string
      object: string
      amount: number
      currency_code: string
      metadata?: Record<string, unknown>
    }
  }
}
