import { SignUp } from "@clerk/nextjs"

export const metadata = { title: "Crear cuenta" }

export default function RegistrarsePage() {
  return (
    <SignUp
      appearance={{
        elements: {
          formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
          card: "shadow-md",
        },
      }}
    />
  )
}
