"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  professionalId: string
  isFavorite: boolean
  /** Si es true, muestra solo el ícono sin texto */
  iconOnly?: boolean
  className?: string
}

export function FavoriteButton({ professionalId, isFavorite: initial, iconOnly, className }: Props) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const method = isFavorite ? "DELETE" : "POST"
      const res = await fetch(`/api/favoritos/${professionalId}`, { method })
      if (res.ok) {
        setIsFavorite(!isFavorite)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={cn(
          "p-2 rounded-full transition-colors disabled:opacity-50",
          isFavorite
            ? "text-red-500 bg-red-50 hover:bg-red-100"
            : "text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-400",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50",
        isFavorite
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      )}
      {isFavorite ? "En favoritos" : "Guardar"}
    </button>
  )
}
