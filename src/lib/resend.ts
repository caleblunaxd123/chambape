import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder")

const FROM = process.env.RESEND_FROM_EMAIL ?? "ChambaPe <hola@chambape.pe>"

// ─── Templates de email ───────────────────────────────────────────

export async function enviarEmailVerificacionAprobada(to: string, nombre: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "¡Tu cuenta fue verificada! Empieza a recibir clientes",
    html: `
      <h2>¡Hola ${nombre}! 🎉</h2>
      <p>Tu cuenta en <strong>ChambaPe</strong> ha sido verificada exitosamente.</p>
      <p>Como bienvenida, te hemos acreditado <strong>5 créditos gratis</strong> para que puedas empezar a contactar clientes.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesional/oportunidades"
         style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Ver solicitudes disponibles
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">
        El equipo de ChambaPe 🔧
      </p>
    `,
  })
}

export async function enviarEmailNuevaPropuesta(
  to: string,
  nombreCliente: string,
  nombreProfesional: string,
  categoria: string,
  requestId: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${nombreProfesional} quiere ayudarte con tu solicitud`,
    html: `
      <h2>Hola ${nombreCliente},</h2>
      <p><strong>${nombreProfesional}</strong> ha enviado una propuesta para tu solicitud de <strong>${categoria}</strong>.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/solicitudes/${requestId}"
         style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Ver propuesta
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">
        El equipo de ChambaPe 🔧
      </p>
    `,
  })
}

export async function enviarEmailSeleccionado(
  to: string,
  nombreProfesional: string,
  nombreCliente: string,
  telefono: string,
  requestId: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "¡Te eligieron! Ya puedes contactar al cliente",
    html: `
      <h2>¡Felicitaciones ${nombreProfesional}! 🎊</h2>
      <p><strong>${nombreCliente}</strong> te ha seleccionado para su trabajo.</p>
      <p>Puedes contactarlo directamente al: <strong>${telefono}</strong></p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesional/mis-aplicaciones"
         style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Ver detalles
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">
        El equipo de ChambaPe 🔧
      </p>
    `,
  })
}

export async function enviarEmailCreditosBajos(
  to: string,
  nombre: string,
  saldo: number
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Te quedan solo ${saldo} créditos — recarga ahora`,
    html: `
      <h2>Hola ${nombre},</h2>
      <p>Tu saldo de créditos está bajo: solo te quedan <strong>${saldo} créditos</strong>.</p>
      <p>Recarga ahora para no perderte oportunidades de trabajo.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesional/creditos/recargar"
         style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Recargar créditos
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">
        El equipo de ChambaPe 🔧
      </p>
    `,
  })
}

export async function enviarEmailNuevaOportunidad(
  to: string,
  nombreProfesional: string,
  categoria: string,
  distrito: string,
  requestId: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `¡Nueva oportunidad en ${distrito}! 🔧`,
    html: `
      <h2>Hola ${nombreProfesional},</h2>
      <p>Hay un nuevo trabajo de <strong>${categoria}</strong> disponible en <strong>${distrito}</strong>.</p>
      <p>Sé uno de los primeros en postular para aumentar tus posibilidades de ser elegido.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profesional/oportunidades/${requestId}"
         style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
        Ver detalles de la chamba
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">
        El equipo de ChambaPe 🔧
      </p>
    `,
  })
}

