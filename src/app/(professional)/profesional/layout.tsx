import { redirect } from "next/navigation"
import Link from "next/link"
import { requireProfessional } from "@/lib/auth"
import { Logo } from "@/components/shared/Logo"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Search, FileText, Coins, User, Bell, MessageCircle } from "lucide-react"
import { db } from "@/lib/db"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { ProfSidebarContent } from "@/components/layout/ProfSidebarContent"

const NAV_MOBILE = [
  { href: "/profesional/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/profesional/oportunidades", icon: Search, label: "Oportunidades" },
  { href: "/profesional/mensajes", icon: MessageCircle, label: "Mensajes" },
  { href: "/profesional/aplicaciones", icon: FileText, label: "Aplicaciones" },
  { href: "/profesional/perfil/editar", icon: User, label: "Perfil" },
]

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireProfessional()

  const unreadCount = await db.notification.count({
    where: { userId: user.id, read: false },
  })

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ── Header móvil ─────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-sm">
        <Logo href="/profesional/dashboard" size="xs" />
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            <Coins className="w-3 h-3" />
            {profile.credits}
          </span>
          <NotificationBell count={unreadCount} href="/profesional/notificaciones" />
          <UserButton />
        </div>
      </header>

      <div className="lg:flex">
        {/* ── Sidebar desktop ────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 sticky top-0">
          <ProfSidebarContent 
            unreadCount={unreadCount} 
            credits={profile.credits} 
            planName={(profile as any).subscription?.plan?.name}
          />
        </aside>

        {/* ── Contenido principal ─────────────────── */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Nav inferior móvil ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex z-40 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        {NAV_MOBILE.map(({ href, icon: Icon, label }) => (
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
          href="/profesional/notificaciones"
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
