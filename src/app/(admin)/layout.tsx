import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { LayoutDashboard, Users, ClipboardList, Star, Tag, CreditCard, MessageSquare, Headphones } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton"

const NAV = [
  { href: "/admin/dashboard",     label: "Dashboard",      icon: LayoutDashboard, desc: "Métricas generales" },
  { href: "/admin/profesionales", label: "Profesionales",  icon: Users,           desc: "Verificar y gestionar" },
  { href: "/admin/solicitudes",   label: "Solicitudes",    icon: ClipboardList,   desc: "Todas las solicitudes" },
  { href: "/admin/resenas",       label: "Reseñas",        icon: Star,            desc: "Moderar reseñas" },
  { href: "/admin/categorias",    label: "Categorías",     icon: Tag,             desc: "Gestionar servicios" },
  { href: "/admin/transacciones", label: "Transacciones",  icon: CreditCard,      desc: "Historial de pagos" },
  { href: "/admin/soporte",       label: "Soporte",        icon: Headphones,      desc: "Mesa de ayuda" },
]

const NAV_MOBILE = [
  { href: "/admin/dashboard",     label: "Inicio",    icon: LayoutDashboard },
  { href: "/admin/profesionales", label: "Pros",      icon: Users },
  { href: "/admin/solicitudes",   label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/resenas",       label: "Reseñas",   icon: Star },
  { href: "/admin/soporte",       label: "Soporte",   icon: MessageSquare },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  // Badge: tickets de soporte abiertos
  const openTickets = await db.supportTicket.count({ where: { status: "OPEN" } }).catch(() => 0)

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Header móvil ─────────────────────────── */}
      <header className="lg:hidden bg-[#0d1224] border-b border-white/5 px-4 h-14 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Logo size="xs" variant="dark" />
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
            <Logo size="sm" variant="dark" href="/admin/dashboard" />
            <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-400/80 mt-1 pl-[2.5rem]">
              Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon, desc }) => {
              const isSoporte = href === "/admin/soporte"
              return (
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
                  {isSoporte && openTickets > 0 && (
                    <span className="text-[10px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                      {openTickets}
                    </span>
                  )}
                </Link>
              )
            })}
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
        {NAV_MOBILE.map(({ href, icon: Icon, label }) => {
          const isSoporte = href === "/admin/soporte"
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-gray-500 hover:text-orange-400 transition-colors relative"
            >
              <Icon className="w-5 h-5" />
              {isSoporte && openTickets > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-10px)] text-[8px] font-black bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                  {openTickets > 9 ? "9+" : openTickets}
                </span>
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
