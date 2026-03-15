import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { MessageCircle } from "lucide-react"
import { ConversationList } from "@/components/chat/ConversationList"

export const metadata = { title: "Mensajes" }

export default async function ProfMensajesPage() {
  const { user } = await requireProfessional()

  const rawConvs = await db.conversation.findMany({
    where: {
      OR: [{ clientId: user.id }, { professionalUserId: user.id }],
    },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professionalUser: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, fileName: true, createdAt: true },
      },
      _count: {
        select: {
          messages: { where: { readAt: null, senderId: { not: user.id } } },
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })

  const conversations = rawConvs.map((c) => ({
    id: c.id,
    otherUser: c.professionalUserId === user.id ? c.client : c.professionalUser,
    lastMessage: c.messages[0]
      ? {
          content: c.messages[0].content,
          fileName: c.messages[0].fileName,
          createdAt: c.messages[0].createdAt.toISOString(),
        }
      : null,
    unreadCount: c._count.messages,
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="cp-page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Mensajes
            </h1>
            <p className="text-sm text-gray-400">{conversations.length} conversación{conversations.length !== 1 ? "es" : ""}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 sm:mx-6 overflow-hidden">
        <ConversationList
          conversations={conversations}
          baseHref="/profesional/mensajes"
          emptyLabel="Los clientes te contactarán desde tu perfil público"
        />
      </div>
    </div>
  )
}
