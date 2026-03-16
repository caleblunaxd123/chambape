import { SignUp } from "@clerk/nextjs"

export const metadata = { title: "Crear cuenta — ChambaPe" }

export default function RegistrarsePage() {
  return (
    <SignUp
      // Siempre redirigir a selección de tipo después del registro
      // forceRedirectUrl garantiza que el redirect funcione incluso si
      // hay algún parámetro redirect_url en la URL (ej. desde Clerk internamente)
      forceRedirectUrl="/registrarse/tipo"
      appearance={{
        elements: {
          formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
          card: "shadow-md",
        },
      }}
    />
  )
}
