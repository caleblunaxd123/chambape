import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Rutas que requieren autenticación
// IMPORTANTE: /registrarse/tipo y /registrarse/profesional NO van aquí
// porque son hijas de /registrarse/[[...rest]] (SignUp de Clerk) y el middleware
// las bloquearía. Ambas páginas manejan su propia auth internamente.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/solicitudes/nueva(.*)",
  "/solicitudes/:id(.*)",
  "/favoritos(.*)",
  "/mensajes(.*)",
  "/profesional(.*)",
  "/admin(.*)",
])

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
