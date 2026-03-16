import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PAQUETES_CREDITOS } from "@/constants/paquetes"
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"
import crypto from "crypto"
import { notifyCreditosRecargados } from "@/lib/notifications"

// ─── Valida la firma HMAC-SHA256 según docs oficiales de MercadoPago ───────────
// Docs: https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks
function validateMpSignature(
  secret: string,
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean {
  if (!xSignature || !xRequestId) return false

  // x-signature tiene formato: "ts=<timestamp>,v1=<hash>"
  const parts = xSignature.split(",")
  let ts: string | null = null
  let v1: string | null = null
  for (const part of parts) {
    const [key, value] = part.split("=")
    if (key === "ts") ts = value
    if (key === "v1") v1 = value
  }
  if (!ts || !v1) return false

  // Cadena a firmar según documentación oficial de MP
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  // Comparación segura contra timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await req.json().catch(() => ({}))

    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type") ||
      body.type ||
      (body.action?.startsWith("payment") ? "payment" : null) ||
      (body.action?.startsWith("subscription") ? "subscription_preapproval" : null)

    const id =
      url.searchParams.get("id") ||
      url.searchParams.get("data.id") ||
      body.data?.id ||
      body.id

    if (!topic || !id) {
      console.log("[MP Webhook] Missing topic or id", { topic, id, body })
      return NextResponse.json({ error: "Missing topic or id" }, { status: 400 })
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "No access token configured" }, { status: 500 })
    }

    // ─── Validar firma HMAC (obligatorio en producción) ──────────────────────
    if (MP_WEBHOOK_SECRET) {
      const xSignature = req.headers.get("x-signature")
      const xRequestId = req.headers.get("x-request-id")

      const isValid = validateMpSignature(MP_WEBHOOK_SECRET, xSignature, xRequestId, id)
      if (!isValid) {
        console.warn("[MP Webhook] Firma inválida — posible intento de manipulación", {
          xSignature,
          xRequestId,
          id,
        })
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })

    // ─── TIPO A: PAGO ÚNICO (topic=payment) ──────────────────────────────────
    if (topic === "payment") {
      const paymentApi = new Payment(client)
      const paymentInfo = await paymentApi.get({ id })

      if (paymentInfo.status !== "approved") {
        return NextResponse.json({ ok: true, ignored: true, reason: "not_approved" })
      }

      // Idempotencia: evitar procesar el mismo pago dos veces
      const existingTx = await db.creditTransaction.findFirst({
        where: { culqiChargeId: `mp_${id}` },
      })
      if (existingTx) {
        return NextResponse.json({ ok: true, ignored: true, reason: "already_processed" })
      }

      // external_reference = "professionalId_packageId_ONE_TIME_timestamp"
      const extRef = paymentInfo.external_reference
      if (!extRef || !extRef.includes("_ONE_TIME_")) {
        return NextResponse.json({ ok: true, ignored: true, reason: "not_one_time_chambape_tx" })
      }

      // Parseo seguro: split por "_ONE_TIME_" primero, luego split por "_" una vez
      const [leftPart] = extRef.split("_ONE_TIME_")
      const underscoreIdx = leftPart.indexOf("_")
      if (underscoreIdx === -1) {
        console.error("[MP Webhook] external_reference mal formado:", extRef)
        return NextResponse.json({ error: "Malformed external_reference" }, { status: 400 })
      }
      const professionalId = leftPart.substring(0, underscoreIdx)
      const packageId = leftPart.substring(underscoreIdx + 1)

      const pkg = PAQUETES_CREDITOS.find((p: any) => p.id === packageId)
      if (!pkg) {
        console.error("[MP Webhook] Paquete desconocido:", packageId)
        return NextResponse.json({ error: "Unknown package" }, { status: 400 })
      }

      const profile = await db.professionalProfile.findUnique({
        where: { id: professionalId },
      })

      if (!profile) {
        console.error("[MP Webhook] Perfil profesional no encontrado:", professionalId)
        return NextResponse.json({ error: "Professional not found" }, { status: 400 })
      }

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
            culqiChargeId: `mp_${id}`,
            metadata: { mpPaymentId: id, mpStatus: paymentInfo.status },
          },
        }),
      ])

      // Notificar al profesional (async, no bloquea la respuesta al webhook)
      notifyCreditosRecargados(profile.userId, pkg.credits, profile.credits + pkg.credits, pkg.name).catch(() => {})

      console.log(`[MP Webhook] Pago único procesado: ${pkg.credits} créditos → profesional ${professionalId}`)
      return NextResponse.json({ ok: true })
    }

    // ─── TIPO B: SUSCRIPCIÓN (topic=subscription_preapproval) ────────────────
    if (topic === "subscription_preapproval") {
      const preApprovalApi = new PreApproval(client)
      const subInfo = await preApprovalApi.get({ id })

      const payerEmail = subInfo.payer_email
      const mpPlanId = (subInfo as any).preapproval_plan_id

      if (!payerEmail || !mpPlanId) {
        return NextResponse.json({ ok: true, ignored: true, reason: "missing_email_or_plan_id" })
      }

      // Buscar usuario por email
      const user = await db.user.findUnique({
        where: { email: payerEmail },
        include: { professionalProfile: true },
      })

      if (!user?.professionalProfile) {
        console.error(`[MP Webhook] Suscripción para ${payerEmail} sin cuenta profesional en ChambaPe.`)
        return NextResponse.json({ ok: true, ignored: true, reason: "user_not_found" })
      }

      const professionalId = user.professionalProfile.id

      // Buscar plan en DB por mpPlanId
      const plan = await (db as any).subscriptionPlan.findFirst({
        where: { mpPlanId },
      })

      if (!plan) {
        console.error(`[MP Webhook] mpPlanId ${mpPlanId} no existe en la DB.`)
        return NextResponse.json({ ok: true, ignored: true, reason: "plan_not_found" })
      }

      const statusMap: Record<string, "ACTIVE" | "CANCELLED" | "PAST_DUE"> = {
        authorized: "ACTIVE",
        paused: "PAST_DUE",
        cancelled: "CANCELLED",
      }
      const statusFinal = statusMap[subInfo.status!] ?? "CANCELLED"

      // Upsert suscripción
      await (db as any).professionalSubscription.upsert({
        where: { professionalId },
        update: {
          planId: plan.id,
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null,
          updatedAt: new Date(),
        },
        create: {
          professionalId,
          planId: plan.id,
          mpSubscriptionId: id,
          status: statusFinal,
          nextBillingDate: subInfo.next_payment_date ? new Date(subInfo.next_payment_date) : null,
        },
      })

      // Acreditar créditos si la suscripción está activa (con idempotencia de 25 días)
      if (statusFinal === "ACTIVE") {
        const existingTx = await db.creditTransaction.findFirst({
          where: {
            professionalId,
            culqiChargeId: `mpsub_${id}`,
          },
          orderBy: { createdAt: "desc" },
        })

        const shouldAward =
          !existingTx ||
          Date.now() - existingTx.createdAt.getTime() > 25 * 24 * 60 * 60 * 1000

        if (shouldAward) {
          const profile = user.professionalProfile
          await db.$transaction([
            db.professionalProfile.update({
              where: { id: professionalId },
              data: { credits: { increment: (plan as any).creditsPerMonth } },
            }),
            db.creditTransaction.create({
              data: {
                professionalId,
                type: "PURCHASE",
                credits: (plan as any).creditsPerMonth,
                amountPen: (plan as any).pricePen,
                balance: profile.credits + (plan as any).creditsPerMonth,
                description: `Mensualidad Plan ${(plan as any).name}`,
                culqiChargeId: `mpsub_${id}`,
                metadata: { mpSubscriptionId: id, mpStatus: subInfo.status },
              },
            }),
          ])
          notifyCreditosRecargados(
            user.id,
            (plan as any).creditsPerMonth,
            profile.credits + (plan as any).creditsPerMonth,
            `Plan ${(plan as any).name}`,
          ).catch(() => {})

          console.log(
            `[MP Webhook] ${(plan as any).creditsPerMonth} créditos acreditados a ${payerEmail} por suscripción ${id}`,
          )
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, ignored: true, reason: "unknown_topic" })
  } catch (error) {
    console.error("[MP_WEBHOOK_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
