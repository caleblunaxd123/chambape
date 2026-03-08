import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, PlusCircle, ClipboardList, Heart } from "lucide-react"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NotificationBell } from "@/components/ui/NotificationBell"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-10">
        <Link href="/dashboard" className="font-bold text-orange-500 text-lg">
          ChambaPe
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell count={unreadCount} href="/notificaciones" />
          <UserButton />
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 p-4 gap-1 sticky top-0">
          <Link href="/dashboard" className="font-bold text-orange-500 text-xl mb-6 px-2">
            ChambaPe 🔧
          </Link>

          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
            <NotificationBell count={unreadCount} href="/notificaciones" />
            <UserButton showName />
          </div>
        </aside>

        <main className="flex-1 min-h-screen">{children}</main>
      </div>

      {/* Nav inferior móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="h-16 lg:hidden" />
    </div>
  )
}
