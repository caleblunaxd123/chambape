import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/solicitudes/nueva(.*)",
  "/solicitudes/:id(.*)",
  "/favoritos(.*)",
  "/profesional(.*)",
  "/admin(.*)",
])

// Rutas exclusivas para admin
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Incluir siempre rutas de API y TRPC
    "/(api|trpc)(.*)",
  ],
}
