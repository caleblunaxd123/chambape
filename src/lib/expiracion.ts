// Marca como EXPIRED todas las solicitudes OPEN cuyo expiresAt ya pasó
// Llamar antes de queries en páginas que muestran solicitudes activas
import { db } from "@/lib/db"

export async function expireSolicitudesVencidas() {
  try {
    await db.serviceRequest.updateMany({
      where: {
        status: "OPEN",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    })
  } catch {
    // No bloquear la página si falla
  }
}
