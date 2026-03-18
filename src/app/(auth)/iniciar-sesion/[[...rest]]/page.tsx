import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { UserPlus } from "lucide-react"

export const metadata = { title: "Iniciar sesión — ChambaPe" }

export default function IniciarSesionPage() {
  return (
    <div className="w-full max-w-md flex flex-col gap-4">

      {/* ── Banner "¿Primera vez?" — visible ANTES del formulario ── */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-orange-900 leading-tight">¿Primera vez en ChambaPe?</p>
          <p className="text-xs text-orange-700 mt-0.5">Esta pantalla es solo para cuentas existentes.</p>
        </div>
        <Link
          href="/registrarse"
          className="shrink-0 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Crear cuenta →
        </Link>
      </div>

      {/* ── Widget de Clerk ── */}
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-xl border border-gray-100 rounded-2xl w-full",
            headerTitle: "text-gray-900 font-black text-2xl",
            headerSubtitle: "text-gray-500 text-sm",
            socialButtonsBlockButton:
              "border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all font-medium",
            formButtonPrimary:
              "bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors rounded-xl",
            formFieldInput:
              "border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl",
            footerActionLink: "text-orange-500 hover:text-orange-600 font-semibold",
            identityPreviewText: "text-gray-700",
            formFieldLabel: "text-gray-700 font-medium text-sm",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-400 text-xs",
          },
        }}
      />
    </div>
  )
}
