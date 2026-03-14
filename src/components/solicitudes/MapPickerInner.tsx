"use client"

// Este componente SIEMPRE se importa dinámicamente con { ssr: false }
// para evitar problemas de window/document en SSR
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { DISTRITOS } from "@/constants/distritos"

export interface MapLocation {
  lat: number
  lng: number
  address: string
  district: string
}

interface Props {
  value: MapLocation | null
  onChange: (loc: MapLocation) => void
  detecting: boolean
  onDetect: () => void
}

// Lima centro como coordenadas por defecto
const LIMA_CENTER: [number, number] = [-12.046374, -77.042793]
const DEFAULT_ZOOM = 13

// Normaliza un nombre a slug para comparar con DISTRITOS
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

// Busca el slug de Lima que mejor coincide con el nombre dado
function findDistrictSlug(name: string): string {
  if (!name) return ""
  const slug = toSlug(name)
  const exact = DISTRITOS.find((d) => d.slug === slug)
  if (exact) return exact.slug
  // Búsqueda parcial
  const partial = DISTRITOS.find(
    (d) => d.slug.includes(slug) || slug.includes(d.slug)
  )
  return partial?.slug ?? ""
}

export default function MapPickerInner({ value, onChange, detecting, onDetect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const isGeocodingRef = useRef(false)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (isGeocodingRef.current) return
    isGeocodingRef.current = true
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { "User-Agent": "ChambaPe/1.0" } }
      )
      const data = await res.json()
      const addr = data.address ?? {}

      // Extraer nombre del distrito de Lima
      const rawDistrict =
        addr.suburb ??
        addr.city_district ??
        addr.neighbourhood ??
        addr.quarter ??
        addr.municipality ??
        ""

      const district = findDistrictSlug(rawDistrict)

      // Construir dirección legible
      const parts = [
        addr.road ?? addr.pedestrian ?? "",
        addr.house_number ?? "",
        rawDistrict,
        addr.city ?? "Lima",
      ].filter(Boolean)
      const address = parts.slice(0, 3).join(", ")

      onChange({ lat, lng, address, district })
    } catch {
      // Si falla el geocoding, igual guardamos las coordenadas
      onChange({ lat, lng, address: "", district: "" })
    } finally {
      isGeocodingRef.current = false
    }
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return

      const initialPos: [number, number] = value
        ? [value.lat, value.lng]
        : LIMA_CENTER

      const map = L.map(containerRef.current, {
        center: initialPos,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map)

      // Ícono personalizado con emoji para evitar el bug de webpack/leaflet
      const customIcon = L.divIcon({
        className: "",
        html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));transform:translateY(-50%)">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker(initialPos, {
        draggable: true,
        icon: customIcon,
      }).addTo(map)

      marker.on("dragend", () => {
        const pos = marker.getLatLng()
        reverseGeocode(pos.lat, pos.lng)
      })

      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        reverseGeocode(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      markerRef.current = marker
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mover marcador cuando cambian las coordenadas externamente (ej: geolocalización)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !value) return
    const pos: [number, number] = [value.lat, value.lng]
    markerRef.current.setLatLng(pos)
    mapRef.current.setView(pos, 16)
  }, [value?.lat, value?.lng])

  return (
    <div className="space-y-3">
      {/* Botón detectar ubicación */}
      <button
        type="button"
        onClick={onDetect}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {detecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {detecting ? "Detectando ubicación..." : "Usar mi ubicación actual"}
      </button>

      {/* Mapa */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div ref={containerRef} className="h-56 sm:h-64 w-full" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none whitespace-nowrap">
          Toca el mapa o arrastra el pin para afinar la ubicación
        </div>
      </div>

      {/* Dirección detectada */}
      {value?.address && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
          <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">{value.address}</p>
        </div>
      )}
    </div>
  )
}
