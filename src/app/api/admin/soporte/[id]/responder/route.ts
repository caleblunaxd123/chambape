// POST /api/admin/soporte/[id]/responder
// El admin envía una respuesta al usuario por email y marca el ticket como REPLIED.
// Solo accesible para admins.

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { z } from "zod"

const schema = z.object({
  respuesta: z.string().min(10, "La respuesta debe tener al menos 10 caracteres"),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      )
    }

    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
    }

    const { respuesta } = parsed.data
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "ChambaPe <hola@chambape.pe>"

    // ── Enviar email al usuario ───────────────────────────────────────────────
    await resend.emails.send({
      from: fromEmail,
      to: ticket.email,
      subject: `Re: ${ticket.asunto} — Soporte ChambaPe`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:20px">💬 Respuesta de Soporte ChambaPe</h2>
          </div>
          <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">

            <p style="color:#374151;font-size:15px">Hola <strong>${ticket.nombre}</strong>,</p>
            <p style="color:#374151;font-size:14px">Gracias por contactarnos. Aquí nuestra respuesta a tu consulta sobre <em>"${ticket.asunto}"</em>:</p>

            <div style="margin:20px 0;padding:20px;background:white;border-radius:8px;border-left:4px solid #f97316;border:1px solid #e5e7eb">
              <p style="margin:0;color:#111827;font-size:15px;line-height:1.7;white-space:pre-wrap">${respuesta}</p>
            </div>

            <p style="margin-top:24px;font-size:13px;color:#6b7280">
              Si tienes más preguntas, puedes escribirnos directamente respondiendo este correo o usando el chat de soporte en <a href="https://chambape.pe" style="color:#f97316">chambape.pe</a>.
            </p>

            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb">
              <p style="margin:0;font-size:12px;color:#9ca3af">Equipo ChambaPe • Lima, Perú</p>
            </div>
          </div>

          <!-- Mensaje original -->
          <div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:8px;border:1px solid #e5e7eb">
            <p style="margin:0 0 8px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Tu mensaje original</p>
            <p style="margin:0;font-size:13px;color:#6b7280;white-space:pre-wrap">${ticket.mensaje}</p>
          </div>
        </div>
      `,
    })

    // ── Actualizar ticket ─────────────────────────────────────────────────────
    const updated = await db.supportTicket.update({
      where: { id },
      data: {
        status: "REPLIED",
        respuesta,
        repliedAt: new Date(),
      },
    })

    return NextResponse.json({ ticket: updated })
  } catch (error) {
    console.error("[SOPORTE_RESPONDER]", error)
    return NextResponse.json({ error: "Error al enviar respuesta" }, { status: 500 })
  }
}
