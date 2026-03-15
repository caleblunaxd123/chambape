"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk, useUser, UserButton } from "@clerk/nextjs"
import { LayoutDashboard, PlusCircle, ClipboardList, Heart, Users, MessageCircle, LogOut } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { Logo } from "@/components/shared/Logo"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Inicio",
    desc: "Resumen de tu actividad",
  },
  {
    href: "/solicitudes/nueva",
    icon: PlusCircle,
    label: "Nueva solicitud",
    desc: "Pide un servicio",
    highlight: true,
  },
  {
    href: "/solicitudes",
    icon: ClipboardList,
    label: "Mis solicitudes",
    desc: "Seguimiento de tus pedidos",
  },
  {
    href: "/profesionales",
    icon: Users,
    label: "Profesionales",
    desc: "Buscar y contactar pros",
  },
  {
    href: "/mensajes",
    icon: MessageCircle,
    label: "Mensajes",
    desc: "Chat con profesionales",
  },
  {
    href: "/favoritos",
    icon: Heart,
    label: "Favoritos",
    desc: "Profesionales guardados",
  },
]

interface ClientSidebarContentProps {
  unreadCount: number
}

export function ClientSidebarContent({ unreadCount }: ClientSidebarContentProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()

  return (
    <>
      {/* ── Logo + NotificationBell arriba ───── */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <Logo href="/dashboard" size="sm" />
          {/* Bell ARRIBA como red social */}
          <NotificationBell count={unreadCount} href="/notificaciones" />
        </div>
        <p className="text-[11px] text-gray-400 mt-1 pl-[2.375rem]">Panel de cliente</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc, highlight }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                highlight && !isActive
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200"
                  : isActive
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${highlight && !isActive ? "text-white" : isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{label}</p>
                <p className={`text-[11px] mt-0.5 truncate ${highlight && !isActive ? "text-orange-100" : isActive ? "text-orange-400" : "text-gray-400"}`}>{desc}</p>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer: Tarjeta usuario + Cerrar sesión ── */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {/* Tarjeta usuario */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-gray-400 truncate">Cliente</p>
          </div>
        </div>
        {/* Botón cerrar sesión — siempre visible */}
        <button
          onClick={() => signOut({ redirectUrl: "/iniciar-sesion" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-100 hover:border-red-100 transition-all duration-150 group"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </>
  )
}
