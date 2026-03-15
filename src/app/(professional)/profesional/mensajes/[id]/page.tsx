import { notFound, redirect } from "next/navigation"
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { ChatWindow } from "@/components/chat/ChatWindow"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const conv = await db.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { name: true } },
      professionalUser: { select: { name: true } },
    },
  })
  if (!conv) return { title: "Chat" }
  return { title: `Chat — ${conv.client.name} / ${conv.professionalUser.name}` }
}

export default async function ProfChatPage({ params }: Props) {
  const { id } = await params
  const { user } = await requireProfessional()

  const conv = await db.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professionalUser: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })

  if (!conv) notFound()

  if (conv.clientId !== user.id && conv.professionalUserId !== user.id) {
    redirect("/profesional/mensajes")
  }

  const otherUser = conv.professionalUserId === user.id ? conv.client : conv.professionalUser

  // Mark messages as read
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  })

  const initialMessages = conv.messages.map((m) => ({
    id: m.id,
    content: m.content,
    fileUrl: m.fileUrl,
    fileType: m.fileType,
    fileName: m.fileName,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
    sender: {
      id: m.sender.id,
      name: m.sender.name,
      avatarUrl: m.sender.avatarUrl,
    },
  }))

  return (
    <ChatWindow
      conversationId={id}
      currentUserId={user.id}
      otherUser={otherUser}
      initialMessages={initialMessages}
      backHref="/profesional/mensajes"
    />
  )
}
