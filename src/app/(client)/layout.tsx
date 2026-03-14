import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, PlusCircle, ClipboardList, Heart, Bell } from "lucide-react"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { ClientSidebarContent } from "@/components/layout/ClientSidebarContent"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/solicitudes/nueva", icon: PlusCircle, label: "Nueva solicitud" },
  { href: "/solicitudes", icon: ClipboardList, label: "Mis solicitudes" },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
]

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  const unreadCount = await db.notification.count({
    where: { userId: user.id, read: false },
  })

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ── Header móvil ─────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "var(--brand-gradient)" }}>
            <span className="text-white font-black text-xs leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>C</span>
          </div>
          <span className="brand-name text-base text-gray-900">
            Chamba<span className="text-orange-500">Pe</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <NotificationBell count={unreadCount} href="/notificaciones" />
          <UserButton />
        </div>
      </header>

      <div className="lg:flex">
        {/* ── Sidebar desktop ────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 sticky top-0">
          <ClientSidebarContent unreadCount={unreadCount} />
        </aside>

        {/* ── Contenido principal ─────────────────── */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Nav inferior móvil ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex z-40 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        <Link
          href="/notificaciones"
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-gray-400 hover:text-orange-500 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-[calc(50%-14px)] w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Alertas</span>
        </Link>
      </nav>
    </div>
  )
}
