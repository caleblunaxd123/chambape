import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header mínimo */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl font-bold text-orange-500">ChambaPe</span>
          <span className="text-gray-400 text-sm hidden sm:block">🔧</span>
        </Link>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} ChambaPe · Lima, Perú
      </footer>
    </div>
  )
}
