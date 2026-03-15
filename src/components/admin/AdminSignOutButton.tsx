"use client"

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

interface Props {
  compact?: boolean
}

export function AdminSignOutButton({ compact = false }: Props) {
  const { signOut } = useClerk()

  if (compact) {
    return (
      <button
        onClick={() => signOut({ redirectUrl: "/iniciar-sesion" })}
        className="text-gray-500 hover:text-white transition-colors p-1.5"
        title="Cerrar sesión"
      >
        <LogOut className="w-4.5 h-4.5" />
      </button>
    )
  }

  return (
    <div className="px-3 py-4 border-t border-white/5">
      <button
        onClick={() => signOut({ redirectUrl: "/iniciar-sesion" })}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
      >
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4" />
        </div>
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}
