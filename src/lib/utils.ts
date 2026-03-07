import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea soles enteros: 15 → "S/. 15"
export function formatSoles(soles: number): string {
  return `S/. ${soles}`
}

// Formatea fecha relativa en español: "hace 2 horas", "ayer", etc.
export function formatFechaRelativa(date: Date): string {
  const ahora = new Date()
  const diffMs = ahora.getTime() - date.getTime()
  const diffMinutos = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMinutos < 1) return "justo ahora"
  if (diffMinutos < 60) return `hace ${diffMinutos} min`
  if (diffHoras < 24) return `hace ${diffHoras} h`
  if (diffDias === 1) return "ayer"
  if (diffDias < 7) return `hace ${diffDias} días`

  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: diffDias > 365 ? "numeric" : undefined,
  })
}

// Formatea fecha completa: "7 de marzo de 2026"
export function formatFechaCompleta(date: Date): string {
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Etiquetas de urgencia en español
export const URGENCIA_LABELS: Record<string, string> = {
  TODAY: "Hoy mismo",
  THIS_WEEK: "Esta semana",
  THIS_MONTH: "Este mes",
  FLEXIBLE: "Sin prisa",
}

export const URGENCIA_COLORS: Record<string, string> = {
  TODAY: "bg-red-100 text-red-700",
  THIS_WEEK: "bg-orange-100 text-orange-700",
  THIS_MONTH: "bg-blue-100 text-blue-700",
  FLEXIBLE: "bg-gray-100 text-gray-600",
}

// Etiquetas de estado de solicitud
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
}

// Etiquetas de estado de aplicación
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "No seleccionado",
  WITHDRAWN: "Retirada",
}

// Etiquetas de estado de profesional
export const PROFESSIONAL_STATUS_LABELS: Record<string, string> = {
  PENDING_VERIFICATION: "Pendiente de verificación",
  VERIFIED: "Verificado",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  REJECTED: "Rechazado",
}

// Genera iniciales del nombre para avatar fallback
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Trunca texto con ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "..."
}
