import { requireAdmin } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, Users, ClipboardList, Star, Tag, CreditCard, LogOut } from "lucide-react"

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profesionales", label: "Profesionales", icon: Users },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/transacciones", label: "Transacciones", icon: CreditCard },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="px-5 py-5 border-b border-gray-800">
          <span className="text-orange-400 font-bold text-lg">ChambaPe</span>
          <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">
            Admin
          </span>
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

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
