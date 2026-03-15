"use client"

import { useClerk, useUser, UserButton } from "@clerk/nextjs"
import { LogOut, Shield } from "lucide-react"

interface Props {
  compact?: boolean
}

export function AdminSignOutButton({ compact = false }: Props) {
  const { signOut } = useClerk()
  const { user } = useUser()

  if (compact) {
    return (
      <button
        onClick={() => signOut({ redirectUrl: "/iniciar-sesion" })}
        className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
        title="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="px-3 py-3 border-t border-white/5 space-y-2">
      {/* Tarjeta de usuario admin */}
      <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/5 border border-white/5">
        <UserButton />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-200 truncate leading-tight">
            {user?.firstName} {user?.lastName}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400">
            <Shield className="w-3 h-3" />
            Administrador
          </span>
        </div>
      </div>
      {/* Botón cerrar sesión — siempre visible, color rojo suave al hover */}
      <button
        onClick={() => signOut({ redirectUrl: "/iniciar-sesion" })}
        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all group"
      >
        <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Cerrar sesión</span>
      </button>
    </div>
  )
}
