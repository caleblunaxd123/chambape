"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  conversationId?: string | null
  clientId: string
}

export function ProfChatButton({ conversationId, clientId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (conversationId) {
      router.push(`/profesional/mensajes/${conversationId}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })
      if (!res.ok) { toast.error("No se pudo abrir el chat"); return }
      const { id } = await res.json()
      router.push(`/profesional/mensajes/${id}`)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm"
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <MessageSquare className="w-4 h-4" />
      }
      Chat ChambaPe
    </button>
  )
}
