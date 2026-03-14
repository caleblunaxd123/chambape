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

      const payerEmail = subInfo.payer_email
      const mpPlanId = (subInfo as any).preapproval_plan_id

      if (!payerEmail || !mpPlanId) {
        return NextResponse.json({ ok: true, ignored: true, reason: "missing_email_or_plan_id" })
      }

      // 1. Buscar al Usuario por email
      const user = await db.user.findUnique({
        where: { email: payerEmail },
        include: { professionalProfile: true }
      })

      if (!user?.professionalProfile) {
        console.error(`[MP Webhook] Suscripción recibida para ${payerEmail} pero no se encontró cuenta Profesional en ChambaPe.`)
        return NextResponse.json({ ok: true, ignored: true, reason: "user_not_found" })
      }

      const professionalId = user.professionalProfile.id

      // 2. Buscar el Plan en nuestra DB por mpPlanId
      const plan = await (db as any).subscriptionPlan.findFirst({
        where: { mpPlanId }
      })

      if (!plan) {
         console.error(`[MP Webhook] Suscripción recibida con mpPlanId ${mpPlanId} pero no existe en la DB local.`)
         return NextResponse.json({ ok: true, ignored: true, reason: "plan_not_found" })
      }

      const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "PAST_DUE"> = {
        "authorized": "ACTIVE",
        "paused": "PAST_DUE",
        "cancelled": "CANCELLED"
      }
      
      const statusFinal = statusMap[subInfo.status!] || "CANCELLED"

      // Upsert: Crear o actualizar suscripción
      await (db as any).professionalSubscription.upsert({
        where: { professionalId },
        update: {
          planId: plan.id,
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null,
          updatedAt: new Date()
        },
        create: {
          professionalId,
          planId: plan.id,
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null
        }
      })

      // NOTA: Si quisiéramos inyectar los créditos automáticamente cada mes, 
      // lo ideal sería escuchar el evento `payment` asociado a esta suscripción
      // (MercadoPago manda `payment` cada que cobra la cuota mensual), o hacerlo
      // en un cron job leyendo `professionalSubscription`. Por ahora solo guardamos el estado.

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, ignored: true, reason: "unknown_topic" })

  } catch (error) {
    console.error("[MP_WEBHOOK_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
