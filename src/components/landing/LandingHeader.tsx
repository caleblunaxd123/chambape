"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { useUser, UserButton } from "@clerk/nextjs"

function getPanelHref(role?: string) {
  if (role === "PROFESSIONAL") return "/profesional/dashboard"
  if (role === "ADMIN") return "/admin/dashboard"
  return "/dashboard"
}

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#categorias", label: "Servicios" },
  { href: "/profesionales", label: "Profesionales" },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn, isLoaded, user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  const panelHref = getPanelHref(role)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg py-0" : "shadow-md py-0"
      }`}
      style={{ background: "var(--brand-gradient)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo blanco */}
        <Logo href="/" size="sm" className="shrink-0" variant="dark" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/15"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoaded ? (
            <div className="w-28 h-9 bg-white/20 rounded-xl animate-pulse" />
          ) : isSignedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={panelHref}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white bg-white/15 hover:bg-white/25 border border-white/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Mi panel
              </Link>
              <UserButton />
            </div>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/15"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registrarse"
                className="text-sm font-bold text-orange-600 bg-white px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:bg-orange-50 hover:-translate-y-px active:translate-y-0"
              >
                Registrarse gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile: según auth */}
        <div className="flex items-center gap-1.5 md:hidden">
          {isLoaded && isSignedIn ? (
            <>
              <Link
                href={panelHref}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors text-white bg-white/20 border border-white/30"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Panel
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/15"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registrarse"
                className="text-xs font-bold text-orange-600 bg-white px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
          <button
            className="p-2 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/15"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg animate-fade-in">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-1" />
          {isSignedIn ? (
            <Link
              href={panelHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-bold text-orange-600 py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registrarse"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-bold text-white py-3 px-4 rounded-xl text-center transition-all"
                style={{ background: "var(--brand-gradient)" }}
              >
                Registrarse gratis →
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
