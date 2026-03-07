import { redirect } from "next/navigation"
import Link from "next/link"
import { requireProfessional } from "@/lib/auth"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Search,
  FileText,
  Coins,
  User,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/profesional/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/profesional/oportunidades", icon: Search, label: "Oportunidades" },
  { href: "/profesional/aplicaciones", icon: FileText, label: "Aplicaciones" },
  { href: "/profesional/creditos", icon: Coins, label: "Créditos" },
  { href: "/profesional/perfil/editar", icon: User, label: "Mi perfil" },
]

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  await requireProfessional()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:hidden sticky top-0 z-10">
        <Link href="/profesional/dashboard" className="font-bold text-orange-500 text-lg">
          ChambaPe
        </Link>
        <UserButton />
      </header>

      <div className="lg:flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 p-4 gap-1 sticky top-0">
          <Link href="/profesional/dashboard" className="font-bold text-orange-500 text-xl mb-6 px-2">
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

          <div className="mt-auto pt-4 border-t border-gray-100">
            <UserButton showName />
          </div>
        </aside>

        {/* Contenido principal */}
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

      {/* Padding inferior para nav móvil */}
      <div className="h-16 lg:hidden" />
    </div>
  )
}
