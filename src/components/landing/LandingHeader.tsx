"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/shared/Logo"

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#categorias", label: "Servicios" },
  { href: "/profesionales", label: "Profesionales" },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-xl shadow-slate-900/5 py-1"
          : "bg-transparent py-2"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Logo href="/" size="sm" className="shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                scrolled ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50" : "text-gray-700 hover:text-gray-900 hover:bg-white/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/iniciar-sesion"
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              scrolled ? "text-gray-600 hover:text-gray-900" : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registrarse"
            className="text-sm font-bold text-white px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0"
            style={{ background: "var(--brand-gradient)" }}
          >
            Registrarse gratis
          </Link>
        </div>

        {/* Mobile: botones visibles + hamburguesa */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/iniciar-sesion"
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-700 hover:bg-white/60"
            }`}
          >
            Entrar
          </Link>
          <Link
            href="/registrarse"
            className="text-xs font-bold text-white px-3 py-1.5 rounded-xl"
            style={{ background: "var(--brand-gradient)" }}
          >
            Gratis
          </Link>
          <button
            className={`p-2 rounded-lg transition-colors ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-700 hover:bg-white/60"}`}
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
        </div>
      )}
    </header>
  )
}
