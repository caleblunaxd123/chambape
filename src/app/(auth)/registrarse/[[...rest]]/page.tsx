import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { LogIn } from "lucide-react"

export const metadata = { title: "Crear cuenta — ChambaPe" }

export default function RegistrarsePage() {
  return (
    <div className="w-full max-w-md flex flex-col gap-4">

      {/* ── Banner "¿Ya tienes cuenta?" — para usuarios existentes ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <LogIn className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 leading-tight">¿Ya tienes una cuenta?</p>
          <p className="text-xs text-gray-500 mt-0.5">Inicia sesión con tu correo y contraseña.</p>
        </div>
        <Link
          href="/iniciar-sesion"
          className="shrink-0 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Iniciar sesión →
        </Link>
      </div>

      {/* ── Widget de Clerk ── */}
      <SignUp
        forceRedirectUrl="/registrarse/tipo"
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
