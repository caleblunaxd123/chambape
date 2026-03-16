import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { RealtimeNotifications } from "@/components/notifications/RealtimeNotifications"
import { PusherBeamsClient } from "@/components/notifications/PusherBeamsClient"
import { SWRegistration } from "@/components/shared/SWRegistration"
import { InstallPWA } from "@/components/shared/InstallPWA"
import SoporteChat from "@/components/soporte/SoporteChat"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "ChambaPe — Encuentra técnicos y profesionales en Lima",
    template: "%s | ChambaPe",
  },
  description:
    "Conecta con gasfiteros, electricistas, pintores, carpinteros y más profesionales verificados en Lima. Recibe presupuestos gratis en minutos.",
  keywords: [
    "gasfitero Lima",
    "electricista Lima",
    "pintor Lima",
    "técnicos hogar Lima",
    "servicios del hogar Peru",
  ],
  openGraph: {
    title: "ChambaPe — Servicios del hogar en Lima",
    description: "Encuentra profesionales verificados para tu hogar",
    locale: "es_PE",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChambaPe",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: "#f97316",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      signInUrl="/iniciar-sesion"
      signUpUrl="/registrarse"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/registrarse/tipo"
    >
      <html lang="es" suppressHydrationWarning>
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background`}>
          {children}
          <RealtimeNotifications />
          <PusherBeamsClient />
          <SWRegistration />
          <InstallPWA />
          <SoporteChat />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
