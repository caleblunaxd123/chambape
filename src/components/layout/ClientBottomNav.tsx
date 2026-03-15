"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, ClipboardList, Users, MessageCircle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppState } from "@/components/providers/AppStateProvider"

export function ClientBottomNav() {
  const pathname = usePathname()
  const { notifCount, msgCount } = useAppState()

  const items = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    { href: "/solicitudes/nueva", icon: PlusCircle, label: "Solicitar" },
    { href: "/profesionales", icon: Users, label: "Profesionales" },
    { href: "/mensajes", icon: MessageCircle, label: "Mensajes", badge: msgCount },
    { href: "/solicitudes", icon: ClipboardList, label: "Mis pedidos" },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex z-40 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      {items.map(({ href, icon: Icon, label, badge }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors",
              isActive ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none ring-1.5 ring-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Alertas con badge de notificaciones */}
      <Link
        href="/notificaciones"
        className={cn(
          "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors",
          pathname === "/notificaciones" ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
        )}
      >
        <div className="relative">
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none ring-1.5 ring-white">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Alertas</span>
      </Link>
    </nav>
  )
}
