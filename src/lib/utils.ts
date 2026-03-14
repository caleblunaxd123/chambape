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

// ─── Sistema de insignias por nivel ─────────────────────────────────────────
export interface BadgeNivel {
  nivel: "nuevo" | "bronce" | "plata" | "oro" | "elite"
  emoji: string
  label: string
  description: string
  // Colores Tailwind
  bg: string
  text: string
  border: string
  ring: string
}

export function getBadge(totalJobs: number, avgRating: number): BadgeNivel {
  if (totalJobs >= 100 && avgRating >= 4.8) {
    return {
      nivel: "elite",
      emoji: "💎",
      label: "Élite",
      description: "Top 1% de ChambaPe · +100 trabajos · 4.8★",
      bg: "bg-gradient-to-r from-cyan-50 to-blue-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
      ring: "ring-cyan-300",
    }
  }
  if (totalJobs >= 50 && avgRating >= 4.5) {
    return {
      nivel: "oro",
      emoji: "🥇",
      label: "Oro",
      description: "Profesional destacado · +50 trabajos · 4.5★",
      bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      ring: "ring-amber-300",
    }
  }
  if (totalJobs >= 20 && avgRating >= 4.0) {
    return {
      nivel: "plata",
      emoji: "🥈",
      label: "Plata",
      description: "Muy confiable · +20 trabajos · 4.0★",
      bg: "bg-gradient-to-r from-slate-50 to-gray-100",
      text: "text-slate-600",
      border: "border-slate-200",
      ring: "ring-slate-300",
    }
  }
  if (totalJobs >= 5) {
    return {
      nivel: "bronce",
      emoji: "🥉",
      label: "Bronce",
      description: "En camino · +5 trabajos completados",
      bg: "bg-gradient-to-r from-orange-50 to-amber-50",
      text: "text-orange-700",
      border: "border-orange-200",
      ring: "ring-orange-200",
    }
  }
  return {
    nivel: "nuevo",
    emoji: "🌱",
    label: "Nuevo",
    description: "Profesional recién unido a ChambaPe",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    ring: "ring-green-200",
  }
}
