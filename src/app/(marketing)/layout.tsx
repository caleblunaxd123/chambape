import { getDbUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { Logo } from "@/components/shared/Logo"
import { UserButton } from "@clerk/nextjs"
import { Coins } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { ClientSidebarContent } from "@/components/layout/ClientSidebarContent"
import { ClientBottomNav } from "@/components/layout/ClientBottomNav"
import { ProfSidebarContent } from "@/components/layout/ProfSidebarContent"
import { ProfBottomNav } from "@/components/layout/ProfBottomNav"
import { AppStateProvider } from "@/components/providers/AppStateProvider"

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getDbUser()

  // ── Invitado: LandingHeader naranja + spacer ──────────────────────────────────
  if (!user) {
    return (
      <>
        <LandingHeader />
        {/* Spacer para el header fijo (h-16 = 64px) */}
        <div className="pt-16">{children}</div>
      </>
    )
  }

  // ── Datos comunes para usuarios autenticados ─────────────────────────────────
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

  // ── Profesional ──────────────────────────────────────────────────────────────
  if (user.role === "PROFESSIONAL") {
    const profile = await db.professionalProfile.findUnique({
      where: { userId: user.id },
      include: { subscription: { include: { plan: true } } },
    })

    return (
      <AppStateProvider initialNotifs={unreadCount} initialMsgs={unreadMessages}>
        <div className="min-h-screen bg-[#f8f7f5]">
          {/* Header móvil naranja */}
          <header
            className="px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-md"
            style={{ background: "var(--brand-gradient)" }}
          >
            <Logo href="/profesional/dashboard" size="xs" variant="dark" />
            <div className="flex items-center gap-1.5">
              {profile && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 border border-white/25 px-2 py-0.5 rounded-full">
                  <Coins className="w-3 h-3" />
                  {profile.credits}
                </span>
              )}
              <NotificationBell count={unreadCount} href="/profesional/notificaciones" variant="light" />
              <UserButton />
            </div>
          </header>

          <div className="lg:flex">
            {/* Sidebar desktop */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 sticky top-0">
              <ProfSidebarContent
                unreadCount={unreadCount}
                credits={profile?.credits ?? 0}
                planName={(profile as any)?.subscription?.plan?.name}
              />
            </aside>

            {/* Contenido */}
            <main className="flex-1 min-h-screen pb-20 lg:pb-0">
              {children}
            </main>
          </div>

          <ProfBottomNav />
        </div>
      </AppStateProvider>
    )
  }

  // ── Admin ────────────────────────────────────────────────────────────────────
  if (user.role === "ADMIN") {
    return (
      <AppStateProvider initialNotifs={unreadCount} initialMsgs={unreadMessages}>
        <div className="min-h-screen bg-[#f8f7f5]">
          <header
            className="px-4 h-14 flex items-center justify-between sticky top-0 z-40 shadow-md"
            style={{ background: "var(--brand-gradient)" }}
          >
            <Logo href="/admin/dashboard" size="xs" variant="dark" />
            <UserButton />
          </header>
          <main className="flex-1 min-h-screen">{children}</main>
        </div>
      </AppStateProvider>
    )
  }

  // ── Cliente (default) ────────────────────────────────────────────────────────
  return (
    <AppStateProvider initialNotifs={unreadCount} initialMsgs={unreadMessages}>
      <div className="min-h-screen bg-[#f8f7f5]">
        {/* Header móvil naranja */}
        <header
          className="px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-40 shadow-md"
          style={{ background: "var(--brand-gradient)" }}
        >
          <Logo href="/dashboard" size="xs" variant="dark" />
          <div className="flex items-center gap-1.5">
            <NotificationBell count={unreadCount} href="/notificaciones" variant="light" />
            <UserButton />
          </div>
        </header>

        <div className="lg:flex">
          {/* Sidebar desktop */}
          <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 sticky top-0">
            <ClientSidebarContent unreadCount={unreadCount} />
          </aside>

          {/* Contenido */}
          <main className="flex-1 min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
        </div>

        <ClientBottomNav />
      </div>
    </AppStateProvider>
  )
}
