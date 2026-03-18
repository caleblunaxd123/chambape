"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Coins, Users, ClipboardList } from "lucide-react"

type Categoria = {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
  creditCost: number
  order: number
  active: boolean
  _count: { requests: number; professionals: number; subcategories: number }
}

type Props = { categorias: Categoria[] }

const ICONOS_SUGERIDOS = [
  "🔧", "⚡", "🪠", "🎨", "🌿", "🧹", "🔒", "❄️", "🚿", "🛁",
  "🪟", "🚪", "🛋️", "🏠", "🔨", "🪚", "🪛", "💡", "🖼️", "🧰",
  "🐛", "🌡️", "📦", "🚜", "🎭", "🎵", "🎂", "🖥️", "📡", "🔑",
]

const EMPTY_FORM = { name: "", slug: "", icon: "", description: "", creditCost: 5, order: 0 }

export default function CategoriasCRUD({ categorias: initial }: Props) {
  const router = useRouter()
  const [categorias, setCategorias] = useState(initial)
  const [isPending, startTransition] = useTransition()

  // Modal estado
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Categoria | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Modal eliminar
  const [deleteConfirm, setDeleteConfirm] = useState<Categoria | null>(null)

  function openCreate() {
    setForm({ ...EMPTY_FORM, order: categorias.length })
    setSelected(null)
    setError("")
    setModal("create")
  }

  function openEdit(cat: Categoria) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description ?? "",
      creditCost: cat.creditCost,
      order: cat.order,
    })
    setSelected(cat)
    setError("")
    setModal("edit")
  }

  function closeModal() {
    setModal(null)
    setSelected(null)
    setError("")
  }

  // Auto-generar slug desde nombre
  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
    setForm((f) => ({ ...f, name, slug: modal === "create" ? slug : f.slug }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.icon) {
      setError("El nombre y el ícono son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      const url = modal === "edit" ? `/api/admin/categorias/${selected!.id}` : "/api/admin/categorias"
      const method = modal === "edit" ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          creditCost: Number(form.creditCost),
          order: Number(form.order),
          description: form.description || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al guardar")
        return
      }
      if (modal === "create") {
        setCategorias((prev) => [...prev, data].sort((a, b) => a.order - b.order))
      } else {
        setCategorias((prev) => prev.map((c) => (c.id === data.id ? data : c)))
      }
      closeModal()
      startTransition(() => router.refresh())
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(cat: Categoria) {
    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategorias((prev) => prev.map((c) => (c.id === data.id ? data : c)))
        startTransition(() => router.refresh())
      }
    } catch {
      // silencioso
    }
  }

  async function handleDelete(cat: Categoria) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar")
        setDeleteConfirm(null)
        return
      }
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id))
      setDeleteConfirm(null)
      startTransition(() => router.refresh())
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón Nueva Categoría */}
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {/* Error global */}
      {error && !modal && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 hidden sm:grid sm:grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div className="col-span-5">Categoría</div>
          <div className="col-span-2 text-center">Crédito/app</div>
          <div className="col-span-2 text-center">Profesionales</div>
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-2 text-center">Acciones</div>
        </div>

        {categorias.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay categorías. Crea la primera.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className={`px-4 sm:px-5 py-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center ${!cat.active ? "opacity-60 bg-gray-50/50" : ""}`}
              >
                {/* Nombre */}
                <div className="col-span-5 flex items-center gap-3 mb-3 sm:mb-0">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {cat._count.subcategories} subcats · slug: {cat.slug}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:contents text-center">
                  <div className="sm:col-span-2 bg-amber-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                    <p className="text-xs text-gray-400 sm:hidden">Crédito/app</p>
                    <span className="flex items-center justify-center gap-1 text-sm font-bold text-amber-700">
                      <Coins className="w-3.5 h-3.5" />{cat.creditCost}
                    </span>
                  </div>
                  <div className="sm:col-span-2 bg-blue-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                    <p className="text-xs text-gray-400 sm:hidden">Profesionales</p>
                    <span className="flex items-center justify-center gap-1 text-sm font-bold text-blue-700">
                      <Users className="w-3.5 h-3.5" />{cat._count.professionals}
                    </span>
                  </div>
                  {/* Estado (mobile) */}
                  <div className="sm:hidden bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Estado</p>
                    <span className={`text-xs font-semibold ${cat.active ? "text-green-700" : "text-gray-500"}`}>
                      {cat.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>

                {/* Estado desktop */}
                <div className="col-span-1 hidden sm:flex justify-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {cat.active ? "Activa" : "Inactiva"}
                  </span>
                </div>

                {/* Acciones */}
                <div className="col-span-2 flex items-center justify-start sm:justify-center gap-1.5 mt-3 sm:mt-0">
                  {/* Editar */}
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Toggle activo */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`p-1.5 rounded-lg transition-colors ${cat.active ? "text-green-600 hover:bg-red-50 hover:text-red-500" : "text-gray-400 hover:bg-green-50 hover:text-green-600"}`}
                    title={cat.active ? "Desactivar" : "Activar"}
                  >
                    {cat.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>

                  {/* Eliminar (solo si sin datos) */}
                  {cat._count.professionals === 0 && cat._count.requests === 0 && (
                    <button
                      onClick={() => setDeleteConfirm(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "create" ? "Nueva categoría" : "Editar categoría"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
              )}

              {/* Ícono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícono <span className="text-red-500">*</span>
                </label>
                {/* Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-2xl">
                    {form.icon || "?"}
                  </div>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="Pega un emoji aquí..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    maxLength={4}
                  />
                </div>
                {/* Sugeridos */}
                <div className="flex flex-wrap gap-1.5">
                  {ICONOS_SUGERIDOS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                      className={`w-8 h-8 rounded-lg text-lg hover:bg-orange-50 transition-colors ${form.icon === ic ? "bg-orange-100 ring-2 ring-orange-400" : ""}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Gasfitería"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  maxLength={50}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Slug (URL)
                  {modal === "edit" && (
                    <span className="ml-2 text-xs font-normal text-gray-400">No recomendado cambiarlo si ya tiene datos</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  placeholder="gasfiteria"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-400"
                  maxLength={50}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descripción del servicio..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
                  rows={2}
                  maxLength={200}
                />
              </div>

              {/* Crédito y Orden */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Costo en créditos
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="number"
                      value={form.creditCost}
                      onChange={(e) => setForm((f) => ({ ...f, creditCost: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={100}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl transition-colors"
              >
                {loading ? "Guardando..." : modal === "create" ? "Crear categoría" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR ELIMINAR ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">{deleteConfirm.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">¿Eliminar categoría?</h3>
              <p className="text-sm text-gray-500">
                Estás por eliminar <strong>"{deleteConfirm.name}"</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setError("") }}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors"
              >
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
