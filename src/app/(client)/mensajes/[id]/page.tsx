import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
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

export default async function ChatPage({ params }: Props) {
  const { id } = await params
  const user = await requireAuth()

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

  // Verify user belongs to this conversation
  if (conv.clientId !== user.id && conv.professionalUserId !== user.id) {
    redirect("/mensajes")
  }

  const otherUser = conv.clientId === user.id ? conv.professionalUser : conv.client

  // Mark messages as read
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  })

  // Verificar si el trabajo más reciente entre estos dos fue completado
  const latestApp = await db.serviceApplication.findFirst({
    where: {
      status: "ACCEPTED",
      professional: { userId: conv.professionalUserId },
      request: { clientId: conv.clientId },
    },
    orderBy: { createdAt: "desc" },
    select: { request: { select: { status: true, updatedAt: true } } },
  })
  const isCompleted = latestApp?.request.status === "COMPLETED"
  const completedAt = isCompleted ? latestApp?.request.updatedAt : null

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
      backHref="/mensajes"
      isCompleted={isCompleted}
      completedAt={completedAt}
    />
  )
}
