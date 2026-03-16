import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"
import { beamsServer } from "@/lib/pusher-beams"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, string | number | boolean | null>
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
    },
  })

  // 1. Trigger realtime notification via Pusher Channels
  try {
    await pusherServer.trigger(`user-${params.userId}`, "new-notification", {
      id: notification.id,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      createdAt: notification.createdAt,
    })
  } catch (error) {
    console.error("[PUSHER_CHANNELS_ERROR]", error)
  }

  // 2. Push notification nativa via Pusher Beams (llega al celular aunque la app este cerrada)
  if (beamsServer) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
      await beamsServer.publishToInterests([`user-${params.userId}`], {
        web: {
          notification: {
            title: params.title,
            body: params.message,
            icon: `${appUrl}/icons/icon-192x192.png`,
          },
          // data.url: Pusher Beams abre esta URL al hacer tap en la notificacion
          data: { url: `${appUrl}${params.link ?? "/"}` },
        },
      })
    } catch (error) {
      console.error("[PUSHER_BEAMS_ERROR]", error)
    }
  }

    return notification
}

// ─── Helpers por tipo de evento ──────────────────────────────────

export async function notifyNuevaPropuesta(clienteId: string, nombreProfesional: string, requestId: string) {
  return createNotification({
    userId: clienteId,
    type: "NEW_APPLICATION",
    title: "Nueva propuesta recibida",
    message: `${nombreProfesional} envió una propuesta para tu solicitud`,
    link: `/solicitudes/${requestId}`,
    metadata: { requestId },
  })
}

export async function notifyAplicacionAceptada(
  professionalId: string,
  nombreCliente: string,
  requestId: string
) {
  return createNotification({
    userId: professionalId,
    type: "APPLICATION_ACCEPTED",
    title: "¡Te eligieron! 🎉",
    message: `${nombreCliente} te ha seleccionado para su trabajo`,
    link: `/profesional/aplicaciones`,
    metadata: { requestId },
  })
}

export async function notifyNuevaSolicitud(professionalId: string, categoria: string, distrito: string, requestId: string) {
  return createNotification({
    userId: professionalId,
    type: "NEW_REQUEST",
    title: "Nueva solicitud en tu zona",
    message: `Hay un trabajo de ${categoria} disponible en ${distrito}`,
    link: `/profesional/oportunidades/${requestId}`,
    metadata: { requestId },
  })
}

export async function notifyCreditosBajos(professionalId: string, saldo: number) {
  return createNotification({
    userId: professionalId,
    type: "LOW_CREDITS",
    title: "Créditos bajos",
    message: `Te quedan solo ${saldo} créditos. Recarga para no perderte oportunidades`,
    link: `/profesional/creditos/recargar`,
  })
}

export async function notifyVerificacionAprobada(professionalId: string) {
  return createNotification({
    userId: professionalId,
    type: "VERIFICATION_APPROVED",
    title: "¡Cuenta verificada! 🎊",
    message: "Tu identidad fue verificada. Ya puedes aplicar a solicitudes",
    link: `/profesional/oportunidades`,
  })
}

export async function notifyVerificacionRechazada(professionalId: string, motivo: string) {
  return createNotification({
    userId: professionalId,
    type: "VERIFICATION_REJECTED",
    title: "Verificación rechazada",
    message: `Tus documentos fueron rechazados: ${motivo}`,
    link: `/profesional/perfil/editar`,
    metadata: { motivo },
  })
}

export async function notifyCreditosRecargados(
  userId: string,
  credits: number,
  newBalance: number,
  paqueteName: string,
) {
  return createNotification({
    userId,
    type: "CREDITS_PURCHASED",
    title: "¡Créditos añadidos! 🎉",
    message: `Se acreditaron ${credits} créditos (${paqueteName}). Saldo actual: ${newBalance} créditos.`,
    link: "/profesional/creditos",
    metadata: { credits, newBalance },
  })
}

export async function notifyNuevaReseña(professionalId: string, nombreCliente: string, rating: number) {
  return createNotification({
    userId: professionalId,
    type: "NEW_REVIEW",
    title: "Nueva reseña recibida",
    message: `${nombreCliente} te dejó una reseña de ${rating} estrellas`,
    link: `/profesional/perfil/editar#reseñas`,
    metadata: { rating },
  })
}
