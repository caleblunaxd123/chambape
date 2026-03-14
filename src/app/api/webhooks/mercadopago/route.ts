import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PAQUETES_CREDITOS } from "@/constants/paquetes"
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    // 1. Validar la firma del Webhook (Seguridad)
    // Extraer parámetros de la URL genéricos de MercadoPago
    const url = new URL(req.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    const id = url.searchParams.get("id") || url.searchParams.get("data.id")

    if (!topic || !id) {
      return NextResponse.json({ error: "Missing topic or id" }, { status: 400 })
    }

    // Configurar SDK
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "No access token configured" }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })

    // Optional HMAC signature check (if configured in Vercel)
    if (MP_WEBHOOK_SECRET) {
      const signature = req.headers.get("x-signature")
      const ts = req.headers.get("x-request-id")
      // Simplificado para el ejemplo. En prod validaríamos el HMAC según docs de MP.
    }

    // ─── TIPO A: PAGO ÚNICO (topic=payment) ──────────────────────────
    if (topic === "payment") {
      const paymentApi = new Payment(client)
      const paymentInfo = await paymentApi.get({ id })

      if (paymentInfo.status !== "approved") {
        return NextResponse.json({ ok: true, ignored: true, reason: "not_approved" })
      }

      // Evitar duplicados (idempotencia)
      const existingTx = await db.creditTransaction.findFirst({
        where: { culqiChargeId: `mp_${id}` }, // Reutilizamos este campo o creamos mpChargeId
      })

      if (existingTx) {
        return NextResponse.json({ ok: true, ignored: true, reason: "already_processed" })
      }

      // Extraer datos del external_reference = professionalId_packageId_ONE_TIME_timestamp
      const extRef = paymentInfo.external_reference
      if (!extRef || !extRef.includes("_ONE_TIME_")) {
         return NextResponse.json({ ok: true, ignored: true, reason: "not_one_time_chambape_tx" })
      }

      const [professionalId, packageId] = extRef.split("_")
      const pkg = PAQUETES_CREDITOS.find((p: any) => p.id === packageId)

      if (!pkg) {
         return NextResponse.json({ error: "Unknown package" }, { status: 400 })
      }

      // Procesar recarga
      const profile = await db.professionalProfile.findUnique({
         where: { id: professionalId }
      })

      if (profile) {
        await db.$transaction([
          db.professionalProfile.update({
            where: { id: professionalId },
            data: { credits: { increment: pkg.credits } },
          }),
          db.creditTransaction.create({
            data: {
              professionalId,
              type: "PURCHASE",
              credits: pkg.credits,
              amountPen: pkg.pricePen,
              balance: profile.credits + pkg.credits,
              description: `Recarga MercadoPago - ${pkg.name}`,
              packageId: pkg.id,
              culqiChargeId: `mp_${id}`, // Usamos este temporalmente o añadimos a schema
              metadata: { mpPaymentId: id, mpStatus: paymentInfo.status }
            },
          }),
        ])
      }
      return NextResponse.json({ ok: true })
    }


    // ─── TIPO B: SUSCRIPCIÓN (topic=subscription_preapproval) ─────────
    if (topic === "subscription_preapproval") {
      const preApprovalApi = new PreApproval(client)
      const subInfo = await preApprovalApi.get({ id })

      const extRef = subInfo.external_reference
      if (!extRef || !extRef.includes("_SUBSCRIPTION_")) {
         return NextResponse.json({ ok: true, ignored: true, reason: "not_sub_chambape_tx" })
      }

      const [professionalId, planId] = extRef.split("_")

      const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "PAST_DUE"> = {
        "authorized": "ACTIVE",
        "paused": "PAST_DUE",
        "cancelled": "CANCELLED"
      }
      
      const statusFinal = statusMap[subInfo.status!] || "CANCELLED"

      // Upsert: Crear o actualizar suscripción
      await db.professionalSubscription.upsert({
        where: { professionalId },
        update: {
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null,
          updatedAt: new Date()
        },
        create: {
          professionalId,
          planId,
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null
        }
      })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, ignored: true, reason: "unknown_topic" })

  } catch (error) {
    console.error("[MP_WEBHOOK_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
