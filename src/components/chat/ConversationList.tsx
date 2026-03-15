"use client"

import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { getInitials, cn } from "@/lib/utils"

interface ConversationSummary {
  id: string
  otherUser: { id: string; name: string; avatarUrl: string | null }
  lastMessage: { content: string | null; fileName: string | null; createdAt: string } | null
  unreadCount: number
}

interface Props {
  conversations: ConversationSummary[]
  baseHref: string // "/mensajes" or "/profesional/mensajes"
  emptyLabel?: string
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "ahora"
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
}

export function ConversationList({ conversations, baseHref, emptyLabel }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-semibold text-gray-500 text-sm">Sin conversaciones aún</p>
        <p className="text-xs text-gray-400 mt-1">
          {emptyLabel ?? "Inicia una conversación desde el perfil de un profesional"}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {conversations.map((conv) => {
        const preview = conv.lastMessage?.content
          ? conv.lastMessage.content.length > 50
            ? conv.lastMessage.content.slice(0, 50) + "…"
            : conv.lastMessage.content
          : conv.lastMessage?.fileName
          ? `📎 ${conv.lastMessage.fileName}`
          : "Sin mensajes aún"

        return (
          <Link
            key={conv.id}
            href={`${baseHref}/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-orange-100">
                {conv.otherUser.avatarUrl ? (
                  <Image
                    src={conv.otherUser.avatarUrl}
                    alt={conv.otherUser.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {getInitials(conv.otherUser.name)}
                  </div>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={cn("text-sm truncate", conv.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800")}>
                  {conv.otherUser.name}
                </p>
                {conv.lastMessage && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {formatRelative(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400")}>
                {preview}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
