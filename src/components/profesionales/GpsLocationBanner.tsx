"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, X, ChevronRight, Loader2 } from "lucide-react"
import { DISTRITOS } from "@/constants/distritos"

interface Props {
  profileDistricts: string[]
}

type BannerState = "idle" | "loading" | "found" | "dismissed" | "error" | "outside-lima"

interface DetectedDistrict {
  slug: string
  name: string
}

// Normaliza un texto para comparar: minúsculas, sin tildes, sin caracteres especiales
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
}

// Intenta encontrar el distrito de Lima que coincida con el nombre devuelto por Nominatim
function matchDistrito(nominatimAddress: Record<string, string>): DetectedDistrict | null {
  // Nominatim devuelve el distrito en distintos campos según el tipo de zona
  const candidates = [
    nominatimAddress.suburb,
    nominatimAddress.city_district,
    nominatimAddress.town,
    nominatimAddress.village,
    nominatimAddress.municipality,
    nominatimAddress.county,
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    const normCandidate = normalize(candidate)

    // Buscar match exacto o contenido
    const found = DISTRITOS.find((d) => {
      const normDistrict = normalize(d.name)
      return (
        normDistrict === normCandidate ||
        normDistrict.includes(normCandidate) ||
        normCandidate.includes(normDistrict)
      )
    })

    if (found) return { slug: found.slug, name: found.name }
  }

  return null
}

export function GpsLocationBanner({ profileDistricts }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<BannerState>("idle")
  const [detected, setDetected] = useState<DetectedDistrict | null>(null)

  // ¿Ya hay un distrito GPS activo en la URL?
  const distritoParam = searchParams.get("distrito")

  useEffect(() => {
    // Solo activar en dispositivos móviles / PWA
    const isMobile = window.innerWidth < 1024 || (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (!isMobile) return

    // Si ya hay un filtro de distrito activo, no mostrar el banner
    if (distritoParam) return

    // Si el usuario ya descartó el banner esta sesión, no volver a mostrar
    if (sessionStorage.getItem("gps-banner-dismissed") === "1") return

    // No pedir permisos automáticamente — esperar que el usuario haga algo
    // Solo mostrar el botón para activar GPS
    setState("idle")
  }, [distritoParam])

  async function requestLocation() {
    if (!navigator.geolocation) {
      setState("error")
      return
    }

    setState("loading")

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`,
            {
              headers: { "User-Agent": "ChambaPe/1.0 (contacto@chambape.pe)" },
            }
          )
          if (!res.ok) throw new Error("Nominatim error")

          const data = await res.json()
          const address = data.address as Record<string, string>

          // Verificar que estamos en Lima/Callao
          const state_ = normalize(address.state ?? "")
          const city = normalize(address.city ?? address.county ?? "")
          const isLima =
            state_.includes("lima") || city.includes("lima") || city.includes("callao")

          if (!isLima) {
            setState("outside-lima")
            return
          }

          const match = matchDistrito(address)
          if (match) {
            setDetected(match)
            setState("found")
          } else {
            setState("outside-lima")
          }
        } catch {
          setState("error")
        }
      },
      () => {
        // Usuario denegó permiso o hubo error
        setState("dismissed")
        sessionStorage.setItem("gps-banner-dismissed", "1")
      },
      { timeout: 8000, maximumAge: 60_000 }
    )
  }

  function applyDistrictFilter() {
    if (!detected) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("distrito", detected.slug)
    router.push(`?${params.toString()}`)
  }

  function dismiss() {
    setState("dismissed")
    sessionStorage.setItem("gps-banner-dismissed", "1")
  }

  // Si ya hay un distrito GPS activo, mostrar chip de "limpieza"
  if (distritoParam) {
    const distName = DISTRITOS.find((d) => d.slug === distritoParam)?.name ?? distritoParam
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-4 lg:hidden">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-xs text-blue-700 font-semibold flex-1">
          Mostrando trabajos en <strong>{distName}</strong>
        </span>
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("distrito")
            router.push(`?${params.toString()}`)
          }}
          className="text-blue-400 hover:text-blue-600 transition-colors p-0.5"
          aria-label="Quitar filtro de ubicación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // No mostrar en desktop
  if (state === "dismissed" || state === "outside-lima") return null

  // Botón inicial para activar GPS (no pedimos permisos automáticamente)
  if (state === "idle") {
    return (
      <button
        onClick={requestLocation}
        className="w-full flex items-center gap-2 bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-xl px-3 py-2.5 mb-4 transition-all text-left group lg:hidden"
      >
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className="text-xs text-blue-700 font-semibold flex-1">
          Ver trabajos cerca de tu ubicación actual
        </span>
        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
      </button>
    )
  }

  // Cargando
  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4 lg:hidden">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
        <span className="text-xs text-blue-700 font-semibold">Detectando tu ubicación...</span>
      </div>
    )
  }

  // Distrito encontrado — mostrar banner de confirmación
  if (state === "found" && detected) {
    const isInProfile = profileDistricts.includes(detected.slug)
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 rounded-xl px-3 py-2.5 mb-4 animate-fade-up lg:hidden">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-800 font-semibold leading-tight">
            📍 Estás en <strong>{detected.name}</strong>
          </p>
          {!isInProfile && (
            <p className="text-[10px] text-blue-500 mt-0.5">
              No está en tu zona registrada, pero puedes ver los trabajos aquí
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={applyDistrictFilter}
            className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            Ver trabajos
          </button>
          <button
            onClick={dismiss}
            className="text-blue-400 hover:text-blue-600 transition-colors p-0.5"
            aria-label="Descartar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Error al obtener ubicación
  if (state === "error") {
    return (
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4 lg:hidden">
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 flex-1">No se pudo obtener tu ubicación</span>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-500 p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return null
}
