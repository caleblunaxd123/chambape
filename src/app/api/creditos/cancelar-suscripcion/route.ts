// POST /api/creditos/cancelar-suscripcion
// Cancela la suscripción activa del profesional en MercadoPago y actualiza la DB.
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MercadoPagoConfig, PreApproval } from "mercadopago"

export async function POST() {
  try {
    const user = await requireAuth()

    if (user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "Solo profesionales pueden cancelar suscripciones" }, { status: 403 })
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 })
    }

    // Buscar la suscripción activa del profesional
    const profile = await db.professionalProfile.findUnique({
      where: { userId: user.id },
      include: { subscription: true },
    })

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 })
    }

    const subscription = (profile as any).subscription
    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "No tienes una suscripción activa" }, { status: 400 })
    }

    const mpSubscriptionId = subscription.mpSubscriptionId

    if (mpSubscriptionId) {
      // Cancelar en MercadoPago (solo si tenemos el ID)
      const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
      const preApprovalApi = new PreApproval(client)
      await preApprovalApi.update({
        id: mpSubscriptionId,
        body: { status: "cancelled" },
      })
      console.log(`[CANCEL_SUB] Suscripción ${mpSubscriptionId} cancelada para profesional ${profile.id}`)
    } else {
      // Sin ID de MP: cancelamos solo en DB (admin debe verificar en dashboard de MP si aplica)
      console.warn(`[CANCEL_SUB] Sin mpSubscriptionId para profesional ${profile.id} — cancelando solo en DB`)
    }

    // Actualizar en nuestra DB
    await (db as any).professionalSubscription.update({
      where: { professionalId: profile.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, message: "Suscripción cancelada exitosamente" })
  } catch (error) {
    console.error("[CANCEL_SUB_ERROR]", error)
    return NextResponse.json({ error: "Error al cancelar la suscripción" }, { status: 500 })
  }
}
