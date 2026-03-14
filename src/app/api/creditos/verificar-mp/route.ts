// GET /api/creditos/verificar-mp?payment_id=xxx
// Se llama cuando MP redirige al usuario de vuelta con collection_id.
// Consulta el pago a la API de MP y acredita los créditos de forma inmediata.
// Usa idempotencia para no duplicar si el webhook ya lo procesó.
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PAQUETES_CREDITOS } from "@/constants/paquetes"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function GET(req: Request) {
  try {
    const user = await requireAuth()

    const url = new URL(req.url)
    const paymentId = url.searchParams.get("payment_id")

    if (!paymentId) {
      return NextResponse.json({ error: "payment_id requerido" }, { status: 400 })
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 500 })
    }

    // Idempotencia: ya fue procesado?
    const existing = await db.creditTransaction.findFirst({
      where: { culqiChargeId: `mp_${paymentId}` },
    })
    if (existing) {
      // Ya procesado — solo devolver el saldo actualizado
      const prof = await db.professionalProfile.findUnique({
        where: { userId: user.id },
        select: { credits: true },
      })
      return NextResponse.json({ ok: true, alreadyProcessed: true, credits: prof?.credits ?? 0 })
    }

    // Consultar el pago a MercadoPago
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
    const paymentApi = new Payment(client)
    const paymentInfo = await paymentApi.get({ id: paymentId })

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: false, reason: "not_approved", status: paymentInfo.status })
    }

    // Parsear external_reference: professionalId_packageId_ONE_TIME_timestamp
    const extRef = paymentInfo.external_reference ?? ""
    if (!extRef.includes("_ONE_TIME_")) {
      return NextResponse.json({ ok: false, reason: "not_one_time" })
    }

    const parts = extRef.split("_ONE_TIME_")
    const [professionalIdRaw] = parts[0].split("_")
    const packageId = parts[0].split("_")[1]

    // Verificar que el pago pertenece a este usuario
    const prof = await db.professionalProfile.findFirst({
      where: { userId: user.id },
    })

    if (!prof || prof.id !== professionalIdRaw) {
      return NextResponse.json({ error: "Pago no pertenece a este usuario" }, { status: 403 })
    }

    const pkg = PAQUETES_CREDITOS.find((p) => p.id === packageId)
    if (!pkg) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 400 })
    }

    // Acreditar créditos
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
          amountPen: pkg.pricePen,
          balance: prof.credits + pkg.credits,
          description: `Recarga MercadoPago - ${pkg.name}`,
          packageId: pkg.id,
          culqiChargeId: `mp_${paymentId}`,
          metadata: { mpPaymentId: paymentId, mpStatus: paymentInfo.status },
        },
      }),
    ])

    return NextResponse.json({ ok: true, credits: pkg.credits, newBalance: updatedProfile.credits })
  } catch (error) {
    console.error("[VERIFICAR_MP_ERROR]", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
