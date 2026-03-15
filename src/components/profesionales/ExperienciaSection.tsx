"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Briefcase, Plus, Trash2, Loader2, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Experiencia {
  id: string
  company: string
  role: string
  startYear: number
  endYear: number | null
  description: string | null
}

interface Props {
  experiencias: Experiencia[]
  profileId: string
}

const YEARS = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) => new Date().getFullYear() - i)

export function ExperienciaSection({ experiencias: initial, profileId: _profileId }: Props) {
  const router = useRouter()
  const [experiencias, setExperiencias] = useState<Experiencia[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    company: "",
    role: "",
    startYear: new Date().getFullYear(),
    endYear: null as number | null,
    description: "",
    isCurrent: false,
  })

  function resetForm() {
    setForm({ company: "", role: "", startYear: new Date().getFullYear(), endYear: null, description: "", isCurrent: false })
    setShowForm(false)
  }

  async function handleAdd() {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Completa empresa y cargo")
      return
    }
    if (!form.isCurrent && form.endYear && form.endYear < form.startYear) {
      toast.error("El año de fin no puede ser menor al de inicio")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/profesionales/experiencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          role: form.role.trim(),
          startYear: form.startYear,
          endYear: form.isCurrent ? null : (form.endYear ?? null),
          description: form.description.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? "Error al guardar"); return }
      setExperiencias((prev) => [json, ...prev])
      resetForm()
      toast.success("Experiencia agregada")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/profesionales/experiencia/${id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Error al eliminar"); return }
      setExperiencias((prev) => prev.filter((e) => e.id !== id))
      toast.success("Experiencia eliminada")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista de experiencias */}
      {experiencias.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Sin experiencias registradas</p>
          <p className="text-xs text-gray-400 mt-1">Agrega tus empleos anteriores para fortalecer tu perfil</p>
        </div>
      )}

      {experiencias.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {experiencias.map((exp, i) => (
            <div
              key={exp.id}
              className={cn(
                "flex items-start gap-4 px-5 py-4",
                i > 0 && "border-t border-gray-50"
              )}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center mt-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-orange-500" />
                </div>
                {i < experiencias.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-100 mt-2" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                    <p className="text-sm text-orange-600 font-medium">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <span>{exp.startYear}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{exp.endYear ?? "Actualidad"}</span>
                      {!exp.endYear && (
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">Actual</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    {deletingId === exp.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
                {exp.description && (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario agregar */}
      {showForm && (
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">Nueva experiencia</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Empresa *</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Ej: Maestro, Sodimac, Independiente"
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cargo *</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Ej: Técnico electricista"
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Año inicio *</label>
              <select
                value={form.startYear}
                onChange={(e) => setForm((f) => ({ ...f, startYear: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Año fin</label>
              {form.isCurrent ? (
                <div className="border border-green-200 bg-green-50 rounded-xl px-3 py-2 text-sm text-green-700 font-medium">
                  Trabajo actual
                </div>
              ) : (
                <select
                  value={form.endYear ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, endYear: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Sin especificar</option>
                  {YEARS.filter((y) => y >= form.startYear).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked, endYear: null }))}
              className="w-4 h-4 rounded accent-orange-500"
            />
            <span className="text-xs text-gray-600">Es mi trabajo actual</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción (opcional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe brevemente tus funciones o logros..."
              rows={2}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Guardando..." : "Agregar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botón agregar */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-600 font-medium text-sm py-3.5 rounded-2xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar experiencia laboral
        </button>
      )}
    </div>
  )
}
