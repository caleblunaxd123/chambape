"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { MapPin, X, Loader2, Navigation } from "lucide-react"
import { DISTRITOS } from "@/constants/distritos"

// Distancia de Levenshtein para fuzzy matching de nombres de distrito
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function normalize(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
}

function matchDistrict(nominatimName: string): typeof DISTRITOS[0] | null {
  const normInput = normalize(nominatimName)

  // 1. Búsqueda exacta por slug o nombre normalizado
  const exact = DISTRITOS.find(
    (d) => d.slug === normInput.replace(/\s+/g, "-") || normalize(d.name) === normInput
  )
  if (exact) return exact

  // 2. Busca si el nombre de Nominatim contiene el nombre del distrito o viceversa
  const contains = DISTRITOS.find(
    (d) => normInput.includes(normalize(d.name)) || normalize(d.name).includes(normInput)
  )
  if (contains) return contains

  // 3. Fuzzy match: menor distancia de Levenshtein
  let best: typeof DISTRITOS[0] | null = null
  let bestScore = Infinity
  for (const d of DISTRITOS) {
    const score = levenshtein(normInput, normalize(d.name))
    if (score < bestScore) { bestScore = score; best = d }
  }
  // Solo aceptar si la similitud es razonable (menos de 4 ediciones)
  return bestScore <= 4 ? best : null
}

export default function GpsLocationBannerCliente() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentDistrito = searchParams.get("distrito")

  const [state, setState] = useState<
    "idle" | "loading" | "found" | "applied" | "error" | "dismissed"
  >("idle")
  const [districtFound, setDistrictFound] = useState<typeof DISTRITOS[0] | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Si ya hay un filtro de distrito activo y fue puesto por GPS, mostrar chip activo
  const [gpsDistrict, setGpsDistrict] = useState<string | null>(null)

  useEffect(() => {
    // No mostrar si ya fue descartado en esta sesión
    if (sessionStorage.getItem("gps-banner-cliente-dismissed")) {
      setState("dismissed")
      return
    }
    // Si hay distrito activo puesto por GPS, recordarlo
    const saved = sessionStorage.getItem("gps-distrito-cliente")
    if (saved && currentDistrito === saved) {
      setGpsDistrict(saved)
      setState("applied")
    }
  }, [currentDistrito])

  // Solo mostrar en mobile (pantallas < lg)
  // Si ya fue aplicado o descartado, no mostrar banner inicial
  if (state === "dismissed") return null

  // Si hay distrito GPS activo → mostrar chip para quitar
  if (state === "applied" && gpsDistrict) {
    const districtName = DISTRITOS.find((d) => d.slug === gpsDistrict)?.name ?? gpsDistrict
    return (
      <div className="lg:hidden flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm w-full">
        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-blue-800 font-medium flex-1">
          Mostrando expertos en <strong>{districtName}</strong>
        </span>
        <button
          onClick={() => {
            sessionStorage.removeItem("gps-distrito-cliente")
            setGpsDistrict(null)
            setState("idle")
            // Quitar ?distrito de la URL
            const params = new URLSearchParams(searchParams.toString())
            params.delete("distrito")
            router.push(`${pathname}${params.size ? `?${params}` : ""}`)
          }}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          aria-label="Quitar filtro de ubicación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setErrorMsg("Tu dispositivo no soporta geolocalización")
      setState("error")
      return
    }
    setState("loading")

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`,
            { headers: { "User-Agent": "ChambaPe/1.0 (contacto@chambape.pe)" } }
          )
          const data = await res.json()

          // Nominatim devuelve el distrito en address.suburb, address.city_district o address.county
          const raw =
            data.address?.suburb ??
            data.address?.city_district ??
            data.address?.town ??
            data.address?.county ??
            ""

          const matched = raw ? matchDistrict(raw) : null
          if (matched) {
            setDistrictFound(matched)
            setState("found")
          } else {
            setErrorMsg("No pudimos identificar tu distrito exacto en Lima")
            setState("error")
          }
        } catch {
          setErrorMsg("No se pudo obtener tu ubicación. Intenta de nuevo.")
          setState("error")
        }
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Permiso de ubicación denegado",
          2: "No se pudo detectar la ubicación",
          3: "Tiempo agotado al detectar ubicación",
        }
        setErrorMsg(msgs[err.code] ?? "Error de ubicación")
        setState("error")
      },
      { timeout: 10_000, maximumAge: 60_000 }
    )
  }

  function applyFilter() {
    if (!districtFound) return
    sessionStorage.setItem("gps-distrito-cliente", districtFound.slug)
    setGpsDistrict(districtFound.slug)
    setState("applied")
    const params = new URLSearchParams(searchParams.toString())
    params.set("distrito", districtFound.slug)
    params.delete("page")
    router.push(`${pathname}?${params}`)
  }

  function dismiss() {
    sessionStorage.setItem("gps-banner-cliente-dismissed", "1")
    setState("dismissed")
  }

  // ── Banner inicial (idle) ────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="lg:hidden flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm w-full">
        <Navigation className="w-4 h-4 text-orange-500 shrink-0" />
        <span className="text-sm text-gray-700 flex-1">
          ¿Buscar expertos cerca de ti?
        </span>
        <button
          onClick={detectLocation}
          className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors whitespace-nowrap"
        >
          Usar ubicación
        </button>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 transition-colors ml-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="lg:hidden flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 w-full">
        <Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
        <span className="text-sm text-orange-700">Detectando tu ubicación...</span>
      </div>
    )
  }

  // ── Distrito encontrado — confirmar ──────────────────────────────────────────
  if (state === "found" && districtFound) {
    return (
      <div className="lg:hidden flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 w-full flex-wrap">
        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-sm text-blue-800 flex-1">
          Estás en <strong>{districtFound.name}</strong> — ¿Ver expertos aquí?
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={applyFilter}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver expertos
          </button>
          <button
            onClick={dismiss}
            className="text-sm font-medium text-blue-500 hover:text-blue-700 px-2 py-1.5 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="lg:hidden flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full">
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 flex-1">{errorMsg}</span>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return null
}
