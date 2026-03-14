"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { DISTRITOS } from "@/constants/distritos"
import { cn } from "@/lib/utils"

interface Props {
  profileId: string
  initialBio: string
  initialAvatarUrl: string
  initialDistricts: string[]
  initialCategoryIds: string[]
  initialPhone: string
  categorias: Array<{ id: string; name: string; icon: string }>
}

export function EditarPerfilForm({
  initialBio,
  initialAvatarUrl,
  initialDistricts,
  initialCategoryIds,
  initialPhone,
  categorias,
}: Props) {
  const router = useRouter()
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [districts, setDistricts] = useState<string[]>(initialDistricts)
  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategoryIds)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)

  function toggleDistrito(slug: string) {
    setDistricts((prev) =>
      prev.includes(slug) ? prev.filter((d) => d !== slug) : [...prev, slug]
    )
  }

  function toggleCategoria(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (districts.length === 0) {
      toast.error("Selecciona al menos un distrito")
      return
    }
    if (categoryIds.length === 0) {
      toast.error("Selecciona al menos una especialidad")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/profesionales/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, avatarUrl, districts, categoryIds, phone }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al guardar")
        return
      }
      toast.success("Perfil actualizado correctamente")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Foto de perfil */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Foto de perfil</h2>
        <div className="w-32">
          <ImageUpload
            folder="avatares"
            value={avatarUrl}
            onChange={setAvatarUrl}
            onRemove={() => setAvatarUrl("")}
            aspectRatio="square"
            hint="Foto profesional, fondo claro"
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Descripción profesional</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe tu experiencia, años en el oficio, especialidades, zona donde trabajas..."
          rows={4}
          maxLength={600}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/600</p>
      </div>

      {/* Teléfono / WhatsApp */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Teléfono / WhatsApp</h2>
        <p className="text-xs text-gray-400 mb-3">Se mostrará a clientes que acepten tu propuesta para que puedan contactarte por WhatsApp.</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">+51</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="987 654 321"
            className="w-full pl-12 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
          />
        </div>
      </div>

      {/* Especialidades */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Especialidades</h2>
        <p className="text-xs text-gray-400 mb-4">
          Selecciona los servicios que ofreces ({categoryIds.length} seleccionadas)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categorias.map((cat) => {
            const selected = categoryIds.includes(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategoria(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  selected
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                )}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Zonas de cobertura */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Zonas de cobertura</h2>
        <p className="text-xs text-gray-400 mb-4">
          Distritos donde puedes trabajar ({districts.length} seleccionados)
        </p>
        <div className="space-y-4">
          {["Lima", "Callao"].map((provincia) => (
            <div key={provincia}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {provincia}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DISTRITOS.filter((d) => d.provincia === provincia).map((d) => {
                  const selected = districts.includes(d.slug)
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      onClick={() => toggleDistrito(d.slug)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                        selected
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                      )}
                    >
                      {d.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardar */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  )
}
