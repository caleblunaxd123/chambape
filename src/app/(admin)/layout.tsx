import { requireAdmin } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, Users, ClipboardList, Star, Tag, CreditCard, LogOut, Menu } from "lucide-react"

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profesionales", label: "Profesionales", icon: Users },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/transacciones", label: "Transacciones", icon: CreditCard },
]

// Nav items visibles en mobile bottom nav (los más importantes)
const NAV_MOBILE = [
  { href: "/admin/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/profesionales", label: "Pros", icon: Users },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/categorias", label: "Más", icon: Menu },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header móvil ─────────────────────────────── */}
      <header className="lg:hidden bg-gray-900 text-white px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold text-lg">ChambaPe</span>
          <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </Link>
      </header>

      <div className="lg:flex">
        {/* ── Sidebar desktop ───────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 bg-gray-900 text-white fixed inset-y-0 left-0 z-50">
          <div className="px-5 py-5 border-b border-gray-800">
            <span className="text-orange-400 font-bold text-lg">ChambaPe</span>
            <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">Admin</span>
          </div>

          <nav className="flex-1 py-4 space-y-0.5 px-2">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-2 py-4 border-t border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir del panel
            </Link>
          </div>
        </aside>

        {/* ── Contenido principal ───────────────────── */}
        <main className="flex-1 min-h-screen lg:ml-56 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Nav inferior móvil ────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-40">
        {NAV_MOBILE.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400 hover:text-orange-400 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
