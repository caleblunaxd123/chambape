import { SignIn } from "@clerk/nextjs"

export const metadata = { title: "Iniciar sesión — ChambaPe" }

export default function IniciarSesionPage() {
  return (
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
  )
}
