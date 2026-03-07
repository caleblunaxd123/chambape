import { SignIn } from "@clerk/nextjs"

export const metadata = { title: "Iniciar sesión" }

export default function IniciarSesionPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
          card: "shadow-md",
        },
      }}
    />
  )
}
