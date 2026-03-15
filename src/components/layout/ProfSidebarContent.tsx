"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk, useUser, UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Search, FileText, Coins, User, MessageCircle, LogOut } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { Logo } from "@/components/shared/Logo"
import { useAppState } from "@/components/providers/AppStateProvider"

const NAV_ITEMS = [
  {
    href: "/profesional/dashboard",
    icon: LayoutDashboard,
    label: "Panel",
    desc: "Resumen de actividad",
  },
  {
    href: "/profesional/oportunidades",
    icon: Search,
    label: "Oportunidades",
    desc: "Solicitudes en tu zona",
    highlight: true,
  },
  {
    href: "/profesional/aplicaciones",
    icon: FileText,
    label: "Mis aplicaciones",
    desc: "Estado de tus propuestas",
  },
  {
    href: "/profesional/creditos",
    icon: Coins,
    label: "Créditos",
    desc: "Saldo y recargas",
  },
  {
    href: "/profesional/mensajes",
    icon: MessageCircle,
    label: "Mensajes",
    desc: "Chat con clientes",
  },
  {
    href: "/profesional/perfil/editar",
    icon: User,
    label: "Mi perfil",
    desc: "Editar información",
  },
]

interface ProfSidebarContentProps {
  unreadCount: number
  credits: number
  planName?: string
}

export function ProfSidebarContent({ unreadCount, credits, planName }: ProfSidebarContentProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { msgCount } = useAppState()

  return (
    <>
      {/* ── Logo + NotificationBell arriba ───── */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <Logo href="/profesional/dashboard" size="sm" />
          {/* Bell ARRIBA como Facebook/LinkedIn */}
          <NotificationBell count={unreadCount} href="/profesional/notificaciones" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pl-[2.375rem]">
          <span className="text-[11px] text-gray-400 font-medium">Panel profesional</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <Coins className="w-2.5 h-2.5" />
            {credits}
          </span>
          {planName && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white shadow-sm shadow-orange-200">
              Plan {planName}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc, highlight }) => {
          const isActive = pathname === href || (href !== "/profesional/dashboard" && pathname.startsWith(href))
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
              <div className="relative shrink-0">
                <Icon className={`w-4.5 h-4.5 ${highlight && !isActive ? "text-white" : isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`} />
                {href === "/profesional/mensajes" && msgCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                    {msgCount > 9 ? "9+" : msgCount}
                  </span>
                )}
              </div>
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
        {/* Tarjeta usuario al estilo Slack/Notion */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-gray-400 truncate">Profesional</p>
          </div>
        </div>
        {/* Botón cerrar sesión — siempre visible y claro */}
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
