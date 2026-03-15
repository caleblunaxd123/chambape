// GET /mensajes/nuevo?pro=PROF_USER_ID — crea/recupera conversación y redirige al chat
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const professionalUserId = req.nextUrl.searchParams.get("pro")

  if (!professionalUserId || professionalUserId === user.id) {
    redirect("/mensajes")
  }

  const conv = await db.conversation.upsert({
    where: { clientId_professionalUserId: { clientId: user.id, professionalUserId } },
    create: { clientId: user.id, professionalUserId },
    update: {},
    select: { id: true },
  })

  redirect(`/mensajes/${conv.id}`)
}
