"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, PlusCircle, ClipboardList, Heart, ChevronRight } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"

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

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "var(--brand-gradient)" }}>
            <span className="text-white font-black text-sm leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>C</span>
          </div>
          <span className="brand-name text-[1.15rem] text-gray-900">
            Chamba<span className="text-orange-500">Pe</span>
          </span>
        </Link>
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

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <NotificationBell count={unreadCount} href="/notificaciones" />
        <div className="px-1 py-1">
          <UserButton showName />
        </div>
      </div>
    </>
  )
}
