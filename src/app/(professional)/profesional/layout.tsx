import { redirect } from "next/navigation"
import { requireProfessional } from "@/lib/auth"
import { Logo } from "@/components/shared/Logo"
import { UserButton } from "@clerk/nextjs"
import { Coins } from "lucide-react"
import { db } from "@/lib/db"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { ProfSidebarContent } from "@/components/layout/ProfSidebarContent"
import { ProfBottomNav } from "@/components/layout/ProfBottomNav"
import { AppStateProvider } from "@/components/providers/AppStateProvider"

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireProfessional()

  const [unreadCount, unreadMessages] = await Promise.all([
    db.notification.count({ where: { userId: user.id, read: false } }),
    db.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          OR: [{ clientId: user.id }, { professionalUserId: user.id }],
        },
      },
    }),
  ])

  return (
    <AppStateProvider initialNotifs={unreadCount} initialMsgs={unreadMessages}>
      <div className="min-h-screen bg-[#f8f7f5]">
        {/* ── Header móvil ─────────────────────────── */}
        <header className="px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-md" style={{ background: "var(--brand-gradient)" }}>
          <Logo href="/profesional/dashboard" size="xs" variant="dark" />
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 border border-white/25 px-2 py-0.5 rounded-full">
              <Coins className="w-3 h-3" />
              {profile.credits}
            </span>
            <NotificationBell count={unreadCount} href="/profesional/notificaciones" variant="light" />
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

        {/* ── Nav inferior móvil (profesional) ─────── */}
        <ProfBottomNav />
      </div>
    </AppStateProvider>
  )
}
