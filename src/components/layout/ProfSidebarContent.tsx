"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Search, FileText, Coins, User, MessageCircle } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"

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

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/profesional/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "var(--brand-gradient)" }}>
            <span className="text-white font-black text-sm leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>C</span>
          </div>
          <span className="brand-name text-[1.15rem] text-gray-900">
            Chamba<span className="text-orange-500">Pe</span>
          </span>
        </Link>
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

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <NotificationBell count={unreadCount} href="/profesional/notificaciones" />
        <div className="px-1 py-1">
          <UserButton showName />
        </div>
      </div>
    </>
  )
}
