"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-sm leading-none">C</span>
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">
            Chamba<span className="text-orange-500">Pe</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/iniciar-sesion"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registrarse"
            className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            Registrarse gratis
          </Link>
        </nav>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-2 shadow-lg">
          <Link
            href="/iniciar-sesion"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registrarse"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-xl text-center transition-colors"
          >
            Registrarse gratis
          </Link>
        </div>
      )}
    </header>
  )
}
