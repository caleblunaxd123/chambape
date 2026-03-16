"use client"

import { useEffect, useCallback } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Rol = "CLIENT" | "PROFESSIONAL"

interface Props {
  rol: Rol
}

// ─── Pasos por rol ─────────────────────────────────────────────────────────────

const PASOS_CLIENTE = [
  {
    element: "#tour-nueva-solicitud",
    popover: {
      title: "📋 Nueva solicitud",
      description:
        "Haz clic aquí para publicar un trabajo. Describe qué necesitas, elige el distrito y un presupuesto aproximado. ¡Es gratis!",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-categorias-rapidas",
    popover: {
      title: "🔧 Categorías rápidas",
      description:
        "Elige directamente la categoría del trabajo que necesitas. Gasfitería, electricidad, pintura y más — un clic y ya.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-mis-solicitudes",
    popover: {
      title: "📌 Mis solicitudes",
      description:
        "Aquí aparecen todos los trabajos que has publicado. Puedes ver cuántas propuestas recibiste y aceptar la que más te convence.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-mi-actividad",
    popover: {
      title: "📊 Mi actividad",
      description:
        "Un resumen de todo lo que has hecho en ChambaPe: solicitudes abiertas, propuestas recibidas y trabajos completados.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-pros-destacados",
    popover: {
      title: "⭐ Profesionales destacados",
      description:
        "Mira los expertos mejor calificados en tu zona. Puedes ver sus perfiles, reseñas y trabajos anteriores antes de decidir.",
      side: "left" as const,
      align: "center" as const,
    },
  },
]

const PASOS_PROFESIONAL = [
  {
    element: "#tour-ver-oportunidades",
    popover: {
      title: "🔍 Ver oportunidades",
      description:
        "Haz clic aquí para ver todas las solicitudes de clientes en tus distritos y categorías. Allí puedes postular con tus créditos.",
      side: "bottom" as const,
      align: "end" as const,
    },
  },
  {
    element: "#tour-oportunidades",
    popover: {
      title: "⚡ Oportunidades en tu zona",
      description:
        "Las últimas solicitudes de clientes que coinciden con tu perfil. Haz clic en cualquiera para ver los detalles y enviar tu propuesta.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-creditos-widget",
    popover: {
      title: "💳 Mis créditos",
      description:
        "Aquí ves tu saldo de créditos. Cada vez que postulas a una solicitud se descuentan créditos. ¡Recarga antes de quedarte sin!",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-mis-aplicaciones",
    popover: {
      title: "📝 Mis aplicaciones",
      description:
        "Aquí aparecen tus últimas propuestas enviadas con su estado: pendiente, seleccionado o no seleccionado. ¡Lleva el control!",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-rendimiento",
    popover: {
      title: "📊 Mi rendimiento",
      description:
        "Tu calificación promedio, trabajos completados y tasa de éxito. Cuanto mejor sea tu perfil, más clientes te elegirán.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-accesos-rapidos",
    popover: {
      title: "🚀 Accesos rápidos",
      description:
        "Desde aquí puedes ir a tus mensajes, aplicaciones, editar tu perfil o recargar créditos con un solo clic.",
      side: "left" as const,
      align: "center" as const,
    },
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProductTour({ rol }: Props) {
  const iniciarTour = useCallback(() => {
    const pasos = rol === "CLIENT" ? PASOS_CLIENTE : PASOS_PROFESIONAL

    // Filtrar pasos cuyo elemento existe en el DOM
    const pasosValidos = pasos.filter((p) => {
      const el = document.querySelector(p.element)
      return !!el
    })

    if (pasosValidos.length === 0) return

    const tourDriver = driver({
      animate: true,
      smoothScroll: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: pasosValidos,
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Listo! 🎉",
      progressText: "{{current}} de {{total}}",
      popoverClass: "chambape-tour-popover",
      onDestroyed: () => {
        // Nada extra — el modal ya se cerró antes
      },
    })

    tourDriver.drive()
  }, [rol])

  // Escucha el evento personalizado disparado por TutorialModal
  useEffect(() => {
    const handler = () => iniciarTour()
    window.addEventListener("chambape:start-tour", handler)
    return () => window.removeEventListener("chambape:start-tour", handler)
  }, [iniciarTour])

  return null // No renderiza nada, solo escucha el evento
}
