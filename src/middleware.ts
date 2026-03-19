import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Rutas públicas — cualquier otra queda protegida por Clerk
const isPublicRoute = createRouteMatcher([
  "/",
  "/iniciar-sesion(.*)",
  "/registrarse(.*)",
  "/api/webhooks(.*)",
  // Directorio de profesionales (público)
  "/profesionales(.*)",
  // Páginas SEO por categoría y distrito
  "/gasfiteria(.*)",
  "/electricidad(.*)",
  "/pintura(.*)",
  "/carpinteria(.*)",
  "/cerrajeria(.*)",
  "/limpieza-hogar(.*)",
  "/mudanzas(.*)",
  "/fumigacion(.*)",
  "/electrodomesticos(.*)",
  "/camaras-seguridad(.*)",
  "/jardineria(.*)",
  "/clases-particulares(.*)",
  // Assets del sitio
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.json",
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Excluir archivos estáticos de Next.js y assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jsc|jsg|map|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Siempre correr en rutas de API
    "/(api|trpc)(.*)",
  ],
}
