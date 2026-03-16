// POST /api/soporte
// Recibe un mensaje de soporte, lo guarda en DB y lo envía al admin por email (Resend).
// No requiere autenticación — cualquier usuario (o visitante) puede contactar.
//
// NOTA Resend sandbox: en modo de prueba solo llegan emails a la dirección
// registrada como owner de la cuenta Resend. Verificar dominio en
// https://resend.com/domains para enviar a cualquier destinatario.

import { NextResponse } from "next/server"
import { z } from "zod"
import { resend } from "@/lib/resend"
import { db } from "@/lib/db"

const schema = z.object({
  nombre:  z.string().min(2, "Ingresa tu nombre"),
  email:   z.string().email("Email inválido"),
  asunto:  z.string().min(3, "Ingresa un asunto"),
  mensaje: z.string().min(10, "El mensaje es muy corto (mínimo 10 caracteres)"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      )
    }

    const { nombre, email, asunto, mensaje } = parsed.data
    const adminEmail = process.env.ADMIN_EMAIL

    // ── 1. Guardar en DB ─────────────────────────────────────────────────────
    const ticket = await db.supportTicket.create({
      data: { nombre, email, asunto, mensaje },
    })

    // ── 2. Enviar email al admin ─────────────────────────────────────────────
    if (adminEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ChambaPe <onboarding@resend.dev>",
        to: adminEmail,
        replyTo: email,
        subject: `[Soporte ChambaPe] ${asunto}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:24px;border-radius:12px 12px 0 0">
              <h2 style="color:white;margin:0;font-size:20px">🛠️ Nuevo ticket de soporte #${ticket.id.slice(-6).toUpperCase()}</h2>
            </div>
            <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px">De:</td>
                  <td style="padding:8px 0;font-weight:600;color:#111827">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px">Email:</td>
                  <td style="padding:8px 0;color:#111827">
                    <a href="mailto:${email}" style="color:#f97316">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px">Asunto:</td>
                  <td style="padding:8px 0;font-weight:600;color:#111827">${asunto}</td>
                </tr>
              </table>

              <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #e5e7eb">
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;white-space:pre-wrap">${mensaje}</p>
              </div>

              <div style="margin-top:20px;padding:12px 16px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa">
                <p style="margin:0;font-size:13px;color:#c2410c">
                  👉 Responde desde el panel admin en /admin/soporte para que quede registrado en la base de datos.
                </p>
              </div>

              <p style="margin-top:20px;font-size:13px;color:#9ca3af">
                También puedes responder directamente a este email — llegará a
                <a href="mailto:${email}" style="color:#f97316">${email}</a>.
              </p>
            </div>
          </div>
        `,
      }).catch((err) => {
        // No bloquear si el email falla (sandbox, etc.)
        console.error("[SOPORTE_EMAIL]", err)
      })
    } else {
      console.warn("[SOPORTE] ADMIN_EMAIL no configurado — email no enviado, ticket guardado en DB")
    }

    // ── 3. Notificar al admin en la app ──────────────────────────────────────
    const adminUser = await db.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    })
    if (adminUser) {
      await db.notification.create({
        data: {
          userId:   adminUser.id,
          type:     "SUPPORT_TICKET",
          title:    "📩 Nuevo ticket de soporte",
          message:  `${nombre} (${email}): ${asunto}`,
          link:     `/admin/soporte`,
          metadata: { ticketId: ticket.id, nombre, email, asunto },
        },
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[SOPORTE_ERROR]", error)
    return NextResponse.json({ error: "Error al enviar. Intenta más tarde." }, { status: 500 })
  }
}
