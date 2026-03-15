import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { Logo } from "@/components/shared/Logo"
import { UserButton } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { ClientSidebarContent } from "@/components/layout/ClientSidebarContent"
import { ClientBottomNav } from "@/components/layout/ClientBottomNav"
import { AppStateProvider } from "@/components/providers/AppStateProvider"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  if (user.role === "ADMIN") redirect("/admin/dashboard")

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
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-sm">
          <Logo href="/dashboard" size="xs" />
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

        {/* ── Nav inferior móvil (cliente) ─────────── */}
        <ClientBottomNav />
      </div>
    </AppStateProvider>
  )
}
