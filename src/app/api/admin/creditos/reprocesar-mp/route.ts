// POST /api/admin/creditos/reprocesar-mp
// Permite al admin re-procesar manualmente un pago aprobado de MercadoPago
// que por algún motivo no acreditó créditos (ej. notification_url apuntaba a localhost).
//
// Body: { paymentId: string }
// El endpoint consulta el pago en MP, verifica que sea APPROVED y acredita los créditos
// usando la misma lógica del webhook (con idempotencia).

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { PAQUETES_CREDITOS } from "@/constants/paquetes"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { z } from "zod"

const schema = z.object({
  paymentId: z.string().min(1, "Ingresa el payment_id de MercadoPago"),
})

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    }

    const { paymentId } = parsed.data

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 500 })
    }

    // ── Idempotencia: ya fue procesado? ─────────────────────────────────────────
    const existingTx = await db.creditTransaction.findFirst({
      where: { culqiChargeId: `mp_${paymentId}` },
      include: {
        professional: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    })
    if (existingTx) {
      return NextResponse.json({
        ok: false,
        alreadyProcessed: true,
        message: `Este pago ya fue acreditado el ${existingTx.createdAt.toLocaleDateString("es-PE")} a ${existingTx.professional?.user?.name ?? "desconocido"} (+${existingTx.credits} créditos)`,
      })
    }

    // ── Consultar el pago en MercadoPago ────────────────────────────────────────
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
    const paymentApi = new Payment(client)

    let paymentInfo
    try {
      paymentInfo = await paymentApi.get({ id: paymentId })
    } catch {
      return NextResponse.json({ error: "No se encontró el pago en MercadoPago. Verifica el ID." }, { status: 404 })
    }

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({
        ok: false,
        error: `El pago no está aprobado. Estado actual en MP: "${paymentInfo.status}". Solo se pueden acreditar pagos aprobados.`,
      }, { status: 400 })
    }

    // ── Parsear external_reference ──────────────────────────────────────────────
    const extRef = paymentInfo.external_reference ?? ""
    if (!extRef.includes("_ONE_TIME_")) {
      return NextResponse.json({
        ok: false,
        error: `El pago no corresponde a una recarga única de ChambaPe (external_reference: "${extRef}").`,
      }, { status: 400 })
    }

    // "professionalId_packageId_ONE_TIME_timestamp"
    const [leftPart] = extRef.split("_ONE_TIME_")
    const underscoreIdx = leftPart.indexOf("_")
    if (underscoreIdx === -1) {
      return NextResponse.json({ error: `external_reference mal formado: "${extRef}"` }, { status: 400 })
    }
    const professionalId = leftPart.substring(0, underscoreIdx)
    const packageId = leftPart.substring(underscoreIdx + 1)

    const pkg = PAQUETES_CREDITOS.find((p: any) => p.id === packageId)
    if (!pkg) {
      return NextResponse.json({ error: `Paquete desconocido: "${packageId}"` }, { status: 400 })
    }

    const profile = await db.professionalProfile.findUnique({
      where: { id: professionalId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!profile) {
      return NextResponse.json({ error: `No se encontró el perfil profesional con ID "${professionalId}"` }, { status: 404 })
    }

    // ── Acreditar créditos ───────────────────────────────────────────────────────
    const [updatedProfile] = await db.$transaction([
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
          description: `Recarga MercadoPago [reprocesado admin] - ${pkg.name}`,
          packageId: pkg.id,
          culqiChargeId: `mp_${paymentId}`,
          metadata: { mpPaymentId: paymentId, mpStatus: paymentInfo.status, reprocessedByAdmin: true },
        },
      }),
    ])

    console.log(`[ADMIN REPROCESAR] ${pkg.credits} créditos acreditados a ${profile.user?.name ?? professionalId} por pago ${paymentId}`)

    return NextResponse.json({
      ok: true,
      message: `✅ ${pkg.credits} créditos acreditados a ${profile.user?.name ?? "profesional"} (${profile.user?.email ?? ""})`,
      profesional: profile.user?.name,
      email: profile.user?.email,
      creditsAdded: pkg.credits,
      newBalance: updatedProfile.credits,
      paquete: pkg.name,
      monto: `S/.${pkg.pricePen}`,
    })
  } catch (error) {
    console.error("[ADMIN_REPROCESAR_MP_ERROR]", error)
    return NextResponse.json({ error: "Error interno al reprocesar el pago" }, { status: 500 })
  }
}
