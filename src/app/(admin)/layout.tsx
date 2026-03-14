import { requireAdmin } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, Users, ClipboardList, Star, Tag, CreditCard, Menu } from "lucide-react"
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton"

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Métricas generales" },
  { href: "/admin/profesionales", label: "Profesionales", icon: Users, desc: "Verificar y gestionar" },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList, desc: "Todas las solicitudes" },
  { href: "/admin/resenas", label: "Reseñas", icon: Star, desc: "Moderar reseñas" },
  { href: "/admin/categorias", label: "Categorías", icon: Tag, desc: "Gestionar servicios" },
  { href: "/admin/transacciones", label: "Transacciones", icon: CreditCard, desc: "Historial de pagos" },
]

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
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Header móvil ─────────────────────────── */}
      <header className="lg:hidden bg-[#0d1224] border-b border-white/5 px-4 h-14 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "var(--brand-gradient)" }}>
            <span className="text-white font-black text-xs leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>C</span>
          </div>
          <span className="brand-name text-base text-white">
            Chamba<span className="text-orange-400">Pe</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <AdminSignOutButton compact />
      </header>

      <div className="lg:flex">
        {/* ── Sidebar desktop ────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0d1224] fixed inset-y-0 left-0 z-50 border-r border-white/5">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "var(--brand-gradient)" }}>
                <span className="text-white font-black text-base leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>C</span>
              </div>
              <div>
                <p className="brand-name text-[1.15rem] text-white leading-none">
                  Chamba<span className="text-orange-400">Pe</span>
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-orange-500/15 flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-none">{label}</p>
                  <p className="text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5 truncate">{desc}</p>
                </div>
              </Link>
            ))}
          </nav>

          <AdminSignOutButton />
        </aside>

        {/* ── Contenido principal ─────────────────── */}
        <main className="flex-1 min-h-screen lg:ml-64 bg-[#f8f7f5] rounded-tl-2xl lg:rounded-tl-[2rem] pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Nav inferior móvil ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0d1224]/95 backdrop-blur-md border-t border-white/5 flex z-40">
        {NAV_MOBILE.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-gray-500 hover:text-orange-400 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
