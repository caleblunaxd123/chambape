// POST /api/creditos/cancelar-suscripcion
// Cancela la suscripción activa del profesional en MercadoPago y actualiza la DB.
// Seguridades:
//  - Solo cancela si el estado es ACTIVE (idempotente: 200 si ya estaba cancelada)
//  - Guarda la nextBillingDate de MP antes de cancelar → UI puede mostrar "activo hasta X"
//  - Notifica al profesional con la fecha de vencimiento
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MercadoPagoConfig, PreApproval } from "mercadopago"
import { createNotification } from "@/lib/notifications"

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

    // Buscar el perfil junto con la suscripción
    const profile = await db.professionalProfile.findUnique({
      where: { userId: user.id },
      include: { subscription: true },
    })

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 })
    }

    const subscription = (profile as any).subscription

    // ── Idempotencia: si ya está cancelada, responder OK sin error ───────────────
    if (!subscription) {
      return NextResponse.json({ error: "No tienes ninguna suscripción registrada" }, { status: 400 })
    }
    if (subscription.status === "CANCELLED") {
      return NextResponse.json({ ok: true, alreadyCancelled: true, message: "La suscripción ya estaba cancelada" })
    }
    if (subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "No tienes una suscripción activa" }, { status: 400 })
    }

    const mpSubscriptionId: string | null = subscription.mpSubscriptionId

    // ── Obtener fecha de vencimiento real desde MP (si tenemos el ID) ─────────────
    let activeUntil: Date | null = subscription.nextBillingDate ?? null

    if (mpSubscriptionId) {
      try {
        const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
        const preApprovalApi = new PreApproval(client)

        // 1. Consultar fecha real antes de cancelar
        const subInfo = await preApprovalApi.get({ id: mpSubscriptionId })
        if (subInfo.next_payment_date) {
          activeUntil = new Date(subInfo.next_payment_date)
        }

        // 2. Cancelar en MercadoPago
        await preApprovalApi.update({
          id: mpSubscriptionId,
          body: { status: "cancelled" },
        })
        console.log(`[CANCEL_SUB] Suscripción ${mpSubscriptionId} cancelada en MP para profesional ${profile.id}`)
      } catch (mpError) {
        // Si MP falla, igual cancelamos en nuestra DB (mejor UX que bloquear al usuario)
        console.error(`[CANCEL_SUB] Error al cancelar en MP (aun así cancela en DB):`, mpError)
      }
    } else {
      console.warn(`[CANCEL_SUB] Sin mpSubscriptionId para profesional ${profile.id} — cancelando solo en DB`)
    }

    // ── Actualizar DB con idempotencia: solo si sigue ACTIVE ────────────────────
    const updated = await (db as any).professionalSubscription.updateMany({
      where: {
        professionalId: profile.id,
        status: "ACTIVE", // Guard: no actualiza si ya fue cancelada por otro proceso simultáneo
      },
      data: {
        status: "CANCELLED",
        nextBillingDate: activeUntil, // Guardamos la fecha de vencimiento para mostrarla en UI
        updatedAt: new Date(),
      },
    })

    if (updated.count === 0) {
      // Otro proceso ya la canceló — idempotente
      return NextResponse.json({ ok: true, alreadyCancelled: true, message: "La suscripción ya estaba cancelada" })
    }

    // ── Notificar al profesional ─────────────────────────────────────────────────
    const dateStr = activeUntil
      ? activeUntil.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
      : null

    createNotification({
      userId: user.id,
      type: "CREDITS_PURCHASED", // usamos este tipo como informativo (no hay tipo SUBSCRIPTION_CANCELLED en el enum)
      title: "Suscripción cancelada",
      message: dateStr
        ? `Tu plan fue cancelado. Seguirás teniendo acceso a tus créditos hasta el ${dateStr}.`
        : "Tu plan fue cancelado. Los créditos que ya tienes no se pierden.",
      link: "/profesional/creditos",
    }).catch(() => {})

    return NextResponse.json({
      ok: true,
      message: "Suscripción cancelada",
      activeUntil: activeUntil?.toISOString() ?? null,
    })
  } catch (error) {
    console.error("[CANCEL_SUB_ERROR]", error)
    return NextResponse.json({ error: "Error al cancelar la suscripción" }, { status: 500 })
  }
}
