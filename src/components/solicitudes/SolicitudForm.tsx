"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import {
  ArrowRight, ArrowLeft, CheckCircle, Upload, X, Loader2, MapPin, Camera, ImagePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CATEGORIAS, CATEGORIAS_MAP, type Categoria } from "@/constants/categorias"
import { DISTRITOS } from "@/constants/distritos"
import { cn } from "@/lib/utils"
import type { MapLocation } from "./MapPickerInner"

// Importación dinámica para evitar SSR (Leaflet necesita window)
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  ),
})

// ─── Schema de validación ─────────────────────────────────────────

const schema = z.object({
  title: z.string().min(10, "Describe brevemente qué necesitas (min. 10 caracteres)").max(100),
  categorySlug: z.string().min(1, "Selecciona una categoría"),
  subcategorySlug: z.string().optional(),
  description: z.string().min(30, "Cuéntanos más detalles (min. 30 caracteres)").max(1000),
  district: z.string().min(1, "Selecciona tu distrito"),
  address: z.string().max(200).optional(),
  urgency: z.enum(["TODAY", "THIS_WEEK", "THIS_MONTH", "FLEXIBLE"]),
  budgetMin: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  budgetMax: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  preferredTime: z.string().max(100).optional(),
}).refine(
  (data) => {
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMax >= data.budgetMin
    }
    return true
  },
  { message: "El presupuesto máximo debe ser mayor o igual al mínimo", path: ["budgetMax"] }
).refine(
  (d) => !d.budgetMin || !d.budgetMax || d.budgetMax >= d.budgetMin,
  { message: "El presupuesto máximo debe ser mayor o igual al mínimo", path: ["budgetMax"] }
)

// Definición manual para evitar conflictos de inferencia con z.preprocess
type FormData = {
  title: string
  categorySlug: string
  subcategorySlug?: string
  description: string
  district: string
  address?: string
  urgency: "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "FLEXIBLE"
  budgetMin?: number
  budgetMax?: number
  preferredTime?: string
}

// ─── Pasos del formulario ─────────────────────────────────────────

const PASOS = [
  { numero: 1, label: "Servicio" },
  { numero: 2, label: "Detalles" },
  { numero: 3, label: "Ubicación" },
  { numero: 4, label: "Confirmar" },
]

const URGENCIA_OPTS = [
  { value: "TODAY", label: "Hoy mismo", desc: "Lo necesito urgente", color: "border-red-300 bg-red-50 text-red-700" },
  { value: "THIS_WEEK", label: "Esta semana", desc: "En los próximos días", color: "border-orange-300 bg-orange-50 text-orange-700" },
  { value: "THIS_MONTH", label: "Este mes", desc: "Sin mucha prisa", color: "border-blue-300 bg-blue-50 text-blue-700" },
  { value: "FLEXIBLE", label: "Sin prisa", desc: "Cuando haya disponibilidad", color: "border-gray-300 bg-gray-50 text-gray-600" },
]

interface Props {
  defaultCategoria?: string       // slug pre-seleccionado via query param
  targetProfessionalId?: string   // solicitud directa desde perfil del profesional
}

export function SolicitudForm({ defaultCategoria, targetProfessionalId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fotos, setFotos] = useState<string[]>([])
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null)
  const [detecting, setDetecting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      categorySlug: defaultCategoria ?? "",
      urgency: "FLEXIBLE",
      title: "",
      description: "",
      district: "",
    },
  })

  const categorySlug = watch("categorySlug")
  const urgency = watch("urgency")
  const selectedCat = CATEGORIAS_MAP[categorySlug]

  // ─── Upload de fotos a Cloudinary ────────────────────────────────

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || fotos.length >= 3) return
    e.target.value = ""

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB")
      return
    }

    setUploadingFoto(true)
    try {
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "solicitudes" }),
      })
      if (!sigRes.ok) throw new Error(await sigRes.text())
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      const fd = new FormData()
      fd.append("file", file)
      fd.append("signature", signature)
      fd.append("timestamp", String(timestamp))
      fd.append("folder", folder)
      fd.append("api_key", apiKey)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      })
      const result = await res.json()
      setFotos((prev) => [...prev, result.secure_url])
      toast.success("Foto agregada")
    } catch {
      toast.error("Error al subir la foto")
    } finally {
      setUploadingFoto(false)
    }
  }

  // ─── Manejar selección de ubicación en el mapa ───────────────────

  function handleMapChange(loc: MapLocation) {
    setMapLocation(loc)
    if (loc.district) setValue("district", loc.district)
    if (loc.address) setValue("address", loc.address)
  }

  async function handleDetectLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización")
      return
    }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // El mapa hará el geocoding al recibir las nuevas coordenadas via handleMapChange
        setMapLocation((prev) => ({
          lat: latitude,
          lng: longitude,
          address: prev?.address ?? "",
          district: prev?.district ?? "",
        }))
        setDetecting(false)
      },
      () => {
        toast.error("No se pudo obtener tu ubicación. Selecciónala en el mapa.")
        setDetecting(false)
      },
      { timeout: 10000, maximumAge: 0 }
    )
  }

  // ─── Validar paso antes de avanzar ───────────────────────────────

  async function handleSiguiente() {
    const fieldsPerStep: Record<number, (keyof FormData)[]> = {
      1: ["categorySlug", "title"],
      2: ["description", "urgency"],
      3: ["district"],
    }
    const ok = await trigger(fieldsPerStep[step])
    if (ok) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // ─── Enviar solicitud ─────────────────────────────────────────────

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photos: fotos,
          latitude: mapLocation?.lat,
          longitude: mapLocation?.lng,
          ...(targetProfessionalId ? { targetProfessionalId } : {}),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al publicar la solicitud")
        return
      }

      toast.success(
        targetProfessionalId
          ? "¡Solicitud enviada! El profesional recibirá una notificación."
          : "¡Solicitud publicada! Los profesionales recibirán una notificación."
      )
      router.push(`/solicitudes/${json.id}`)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header con progreso */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6" style={{ background: "var(--brand-gradient)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-[60px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-white font-black text-2xl tracking-wide" style={{ fontFamily: "Outfit, sans-serif" }}>Nueva solicitud</h1>
            <span className="text-orange-100 font-bold text-sm bg-white/20 px-3 py-1 rounded-full">
              Paso {step} de {PASOS.length}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
            <div
              className="bg-white rounded-full h-2 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              style={{ width: `${(step / PASOS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between px-1">
            {PASOS.map((p) => (
              <span
                key={p.numero}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                  p.numero === step ? "text-white" : p.numero < step ? "text-orange-100" : "text-white/40"
                )}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* ── PASO 1: Categoría y título ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">¿Qué tipo de servicio necesitas? <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setValue("categorySlug", cat.slug)
                      setValue("subcategorySlug", "")
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all",
                      categorySlug === cat.slug
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
              {errors.categorySlug && (
                <p className="text-xs text-red-500 mt-1">{errors.categorySlug.message}</p>
              )}
            </div>

            {/* Subcategoría */}
            {selectedCat && (
              <div>
                <Label className="mb-2 block">Subcategoría (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedCat.subcategorias.map((sub) => (
                    <button
                      key={sub.slug}
                      type="button"
                      onClick={() => setValue("subcategorySlug", sub.slug)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-all",
                        watch("subcategorySlug") === sub.slug
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Título */}
            <div>
              <Label htmlFor="title" className="mb-1.5 block">
                ¿Qué necesitas hacer? <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ej: Reparar filtración en el baño del segundo piso"
                className={errors.title ? "border-red-400" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSiguiente}
              disabled={!categorySlug}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
            >
              Siguiente <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── PASO 2: Descripción, urgencia, fotos ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="mb-1.5 block">
                Describe el problema con detalle <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Cuéntanos qué pasó, cuándo ocurrió, qué has intentado hacer... Mientras más detalle, mejores presupuestos recibirás."
                rows={4}
                className={errors.description ? "border-red-400" : ""}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Urgencia */}
            <div>
              <Label className="mb-2 block">¿Qué tan urgente es? <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCIA_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("urgency", opt.value as FormData["urgency"])}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all",
                      urgency === opt.value
                        ? `border-current ${opt.color}`
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs opacity-75 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Horario preferido */}
            <div>
              <Label htmlFor="preferredTime" className="mb-1.5 block">
                Horario preferido (opcional)
              </Label>
              <Input
                id="preferredTime"
                {...register("preferredTime")}
                placeholder="Ej: Mañanas, fines de semana, después de las 6pm"
              />
            </div>

            {/* Presupuesto */}
            <div>
              <Label className="mb-1.5 block">Presupuesto estimado en S/. (opcional)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    {...register("budgetMin")}
                    type="number"
                    placeholder="Mínimo"
                    min={0}
                    inputMode="numeric"
                  />
                </div>
                <span className="text-gray-400">—</span>
                <div className="flex-1">
                  <Input
                    {...register("budgetMax")}
                    type="number"
                    placeholder="Máximo"
                    min={0}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Puedes dejarlo en blanco para recibir cualquier presupuesto
              </p>
            </div>

            {/* Fotos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Fotos del problema <span className="text-gray-400 font-normal text-xs">(opcional)</span></Label>
                {fotos.length > 0 && (
                  <span className="text-xs text-orange-600 font-semibold">{fotos.length}/3</span>
                )}
              </div>

              {/* Miniaturas de fotos subidas */}
              {fotos.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {fotos.map((url, i) => (
                    <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                        aria-label="Eliminar foto"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Zona de carga */}
              {fotos.length < 3 ? (
                <div className={cn(
                  "rounded-xl border-2 border-dashed border-gray-200 p-4 transition-colors",
                  uploadingFoto ? "opacity-60 pointer-events-none" : "hover:border-orange-300"
                )}>
                  {uploadingFoto ? (
                    <div className="flex items-center justify-center gap-2 py-1 text-orange-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Subiendo foto...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 text-center">
                        {fotos.length === 0
                          ? "Las fotos ayudan al profesional a entender el problema"
                          : `Puedes agregar ${3 - fotos.length} foto${3 - fotos.length !== 1 ? "s" : ""} más`}
                      </p>
                      <div className="flex gap-2">
                        {/* Tomar foto — con cámara trasera en móvil/PWA */}
                        <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 cursor-pointer hover:bg-orange-100 active:scale-95 transition-all text-sm font-semibold">
                          <Camera className="w-4 h-4 shrink-0" />
                          <span>Tomar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFotoUpload}
                          />
                        </label>
                        {/* Seleccionar de galería / archivos */}
                        <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all text-sm font-semibold">
                          <ImagePlus className="w-4 h-4 shrink-0" />
                          <span>Galería</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFotoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-green-50 border border-green-100 p-2.5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">3 fotos agregadas. Eliminá una si querés cambiarla.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                <ArrowLeft className="mr-2 w-4 h-4" /> Volver
              </Button>
              <Button type="button" onClick={handleSiguiente} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11">
                Siguiente <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Ubicación ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Mapa interactivo */}
            <div>
              <Label className="mb-2 block">
                Marca tu ubicación en el mapa <span className="text-red-500">*</span>
              </Label>
              <MapPickerInner
                value={mapLocation}
                onChange={handleMapChange}
                detecting={detecting}
                onDetect={handleDetectLocation}
              />
            </div>

            {/* Dirección de referencia */}
            <div>
              <Label htmlFor="address" className="mb-1.5 block">
                Dirección de referencia (opcional)
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Ej: Av. Pardo 342, frente al parque"
              />
              <p className="text-xs text-gray-400 mt-1">
                Solo visible para el profesional que aceptes
              </p>
            </div>

            {/* Distrito (auto-detectado o manual) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Distrito <span className="text-red-500">*</span></Label>
                {watch("district") && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {DISTRITOS.find((d) => d.slug === watch("district"))?.name ?? watch("district")}
                  </span>
                )}
              </div>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {DISTRITOS.map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => setValue("district", d.slug)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm transition-colors",
                      watch("district") === d.slug
                        ? "bg-orange-50 text-orange-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {d.name}
                    <span className="text-xs text-gray-400 ml-2">{d.provincia}</span>
                  </button>
                ))}
              </div>
              {errors.district && (
                <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                <ArrowLeft className="mr-2 w-4 h-4" /> Volver
              </Button>
              <Button type="button" onClick={handleSiguiente} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11">
                Siguiente <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── PASO 4: Confirmar ── */}
        {step === 4 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">Revisa los detalles antes de publicar:</p>

            {[
              { label: "Categoría", value: `${selectedCat?.icon} ${selectedCat?.name}` },
              { label: "Solicitud", value: watch("title") },
              { label: "Descripción", value: watch("description") },
              { label: "Distrito", value: DISTRITOS.find((d) => d.slug === watch("district"))?.name },
              ...(watch("address") ? [{ label: "Dirección", value: watch("address") }] : []),
              { label: "Urgencia", value: URGENCIA_OPTS.find((o) => o.value === urgency)?.label },
              {
                label: "Presupuesto",
                value: watch("budgetMin") || watch("budgetMax")
                  ? `S/. ${watch("budgetMin") ?? 0} - S/. ${watch("budgetMax") ?? "?"}`
                  : "A convenir",
              },
              ...(watch("preferredTime") ? [{ label: "Horario", value: watch("preferredTime") }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs font-medium text-gray-400 w-24 shrink-0">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}

            {fotos.length > 0 && (
              <div className="py-2">
                <p className="text-xs font-medium text-gray-400 mb-2">Fotos ({fotos.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {fotos.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              Tu solicitud será visible para profesionales verificados en <strong>{DISTRITOS.find((d) => d.slug === watch("district"))?.name}</strong>.
              Recibirás hasta <strong>5 presupuestos</strong>.
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)} disabled={loading} className="flex-1 h-11">
                <ArrowLeft className="mr-2 w-4 h-4" /> Volver
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11">
                {loading ? "Publicando..." : "Publicar solicitud"}
                {!loading && <CheckCircle className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
