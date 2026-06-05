import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { esES } from "@clerk/localizations"
import { Toaster } from "@/components/ui/sonner"
import { RealtimeNotifications } from "@/components/notifications/RealtimeNotifications"
import { PusherBeamsClient } from "@/components/notifications/PusherBeamsClient"
import { SWRegistration } from "@/components/shared/SWRegistration"
import { InstallPWA } from "@/components/shared/InstallPWA"
import SoporteChat from "@/components/soporte/SoporteChat"
import { SchemaOrgMarketplace } from "@/components/shared/SchemaOrg"
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
    default: "ChambaPe — Técnicos y Profesionales Verificados en Lima, Perú",
    template: "%s | ChambaPe Lima",
  },
  description:
    "Encuentra gasfiteros, electricistas, pintores, carpinteros y más en Lima. Técnicos verificados con DNI, reviews reales y presupuestos gratis en minutos. Miraflores, San Isidro, Surco, San Borja y más de 44 distritos.",
  keywords: [
    "gasfitero Lima", "electricista Lima", "pintor Lima", "técnicos hogar Lima",
    "gasfitero Miraflores", "electricista San Isidro", "técnico Lima barato",
    "servicio técnico Lima", "plomero Lima", "carpintero Lima", "cerrajero Lima",
    "limpieza hogar Lima", "fumigación Lima", "mudanza Lima", "ChambaPe",
    "técnicos verificados Peru", "servicios del hogar Peru",
  ],
  authors: [{ name: "ChambaPe", url: "https://chambape.com" }],
  creator: "ChambaPe",
  publisher: "ChambaPe",
  metadataBase: new URL("https://chambape.com"),
  openGraph: {
    title: "ChambaPe — Técnicos Verificados en Lima",
    description: "Gasfiteros, electricistas y más profesionales verificados. Presupuestos gratis en minutos.",
    url: "https://www.chambape.pe",
    siteName: "ChambaPe",
    locale: "es_PE",
    type: "website",
    images: [{ url: "https://www.chambape.pe/og-image.jpg", width: 1200, height: 630, alt: "ChambaPe - Técnicos en Lima" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChambaPe — Técnicos Verificados en Lima",
    description: "Encuentra gasfiteros, electricistas y más. Presupuestos gratis.",
  },
  alternates: { canonical: "https://www.chambape.pe" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
      localization={esES}
      signInUrl="/iniciar-sesion"
      signUpUrl="/registrarse"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/registrarse/tipo"
    >
      <html lang="es" suppressHydrationWarning>
        <head>
          <SchemaOrgMarketplace />
        </head>
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
