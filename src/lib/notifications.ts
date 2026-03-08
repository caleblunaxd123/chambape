import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, string | number | boolean | null>
}

export async function createNotification(params: CreateNotificationParams) {
  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
    },
  })
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
