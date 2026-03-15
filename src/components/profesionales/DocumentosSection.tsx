"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Trash2, Loader2, Plus, X, ExternalLink, ShieldCheck, Award, FileUser, Download } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { cn } from "@/lib/utils"

interface Documento {
  id: string
  type: "CV" | "CERTIFICATE" | "CRIMINAL_RECORD"
  title: string
  fileUrl: string
  isPublic: boolean
  createdAt: string
}

interface Props {
  documentos: Documento[]
}

const TYPE_CONFIG = {
  CV: {
    label: "Currículum Vitae",
    icon: FileUser,
    color: "blue",
    folder: "documentos" as const,
    hint: "Sube tu CV en PDF. Solo puede haber uno activo.",
    titlePlaceholder: "Mi CV",
    single: true,
  },
  CERTIFICATE: {
    label: "Certificado / Curso",
    icon: Award,
    color: "emerald",
    folder: "certificados" as const,
    hint: "Diplomas, certificados de cursos, títulos técnicos, etc.",
    titlePlaceholder: "Ej: Certificado de Gasfitería - SENATI 2023",
    single: false,
  },
  CRIMINAL_RECORD: {
    label: "Antecedentes Penales",
    icon: ShieldCheck,
    color: "violet",
    folder: "documentos" as const,
    hint: "Certificado CJDZ o PNP. Genera más confianza con tus clientes.",
    titlePlaceholder: "Certificado de antecedentes penales",
    single: true,
  },
}

// Para PDFs guardados antes del fix (resource_type "auto" → /image/upload/),
// los abrimos via Google Docs Viewer para que el browser los muestre correctamente.
// Los nuevos (resource_type "raw" → /raw/upload/) se abren directamente.
function getPdfViewUrl(fileUrl: string): string {
  if (fileUrl.toLowerCase().endsWith(".pdf") && fileUrl.includes("/image/upload/")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false`
  }
  return fileUrl
}

type DocType = keyof typeof TYPE_CONFIG

type ColorKey = "blue" | "emerald" | "violet"

const COLOR_CLASSES: Record<ColorKey, {
  bg: string; border: string; icon: string; iconBg: string; tag: string; badge: string
}> = {
  blue: {
    bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-500", iconBg: "bg-blue-100",
    tag: "bg-blue-100 text-blue-700", badge: "border-blue-200",
  },
  emerald: {
    bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-500", iconBg: "bg-emerald-100",
    tag: "bg-emerald-100 text-emerald-700", badge: "border-emerald-200",
  },
  violet: {
    bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-500", iconBg: "bg-violet-100",
    tag: "bg-violet-100 text-violet-700", badge: "border-violet-200",
  },
}

export function DocumentosSection({ documentos: initial }: Props) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<Documento[]>(initial)
  const [addingType, setAddingType] = useState<DocType | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [newTitle, setNewTitle] = useState("")
  const [newFileUrl, setNewFileUrl] = useState("")
  const [newIsPublic, setNewIsPublic] = useState(true)

  function startAdd(type: DocType) {
    setAddingType(type)
    setNewTitle(TYPE_CONFIG[type].single ? TYPE_CONFIG[type].titlePlaceholder : "")
    setNewFileUrl("")
    setNewIsPublic(true)
  }

  function cancelAdd() {
    setAddingType(null)
    setNewTitle("")
    setNewFileUrl("")
  }

  async function handleSave() {
    if (!addingType) return
    if (!newTitle.trim()) { toast.error("Ingresa un título"); return }
    if (!newFileUrl) { toast.error("Sube el archivo primero"); return }

    setSaving(true)
    try {
      const res = await fetch("/api/profesionales/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: addingType, title: newTitle.trim(), fileUrl: newFileUrl, isPublic: newIsPublic }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? "Error al guardar"); return }

      // Reemplazar si es tipo único
      if (TYPE_CONFIG[addingType].single) {
        setDocumentos((prev) => [json, ...prev.filter((d) => d.type !== addingType)])
      } else {
        setDocumentos((prev) => [json, ...prev])
      }
      cancelAdd()
      toast.success("Documento guardado")
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
      const res = await fetch(`/api/profesionales/documentos/${id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Error al eliminar"); return }
      setDocumentos((prev) => prev.filter((d) => d.id !== id))
      toast.success("Documento eliminado")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs text-amber-800 font-medium">
          💡 Los clientes que buscan contratar a largo plazo (limpieza mensual, clases, etc.) pueden pedirte tus antecedentes directamente por WhatsApp. Subirlos te da más credibilidad.
        </p>
      </div>

      {/* Sección por tipo */}
      {(Object.keys(TYPE_CONFIG) as DocType[]).map((type) => {
        const config = TYPE_CONFIG[type]
        const Icon = config.icon
        const colors = COLOR_CLASSES[config.color as ColorKey]
        const docsOfType = documentos.filter((d) => d.type === type)
        const isAdding = addingType === type
        const canAdd = !config.single || docsOfType.length === 0

        return (
          <div key={type} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className={cn("flex items-center gap-3 px-5 py-4 border-b", colors.bg, colors.border)}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors.iconBg)}>
                <Icon className={cn("w-4.5 h-4.5", colors.icon)} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{config.label}</p>
                <p className="text-xs text-gray-500">{config.hint}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Docs existentes */}
              {docsOfType.map((doc) => (
                <div key={doc.id} className={cn("flex items-center gap-3 p-3 rounded-xl border", colors.border, colors.bg)}>
                  <FileText className={cn("w-5 h-5 flex-shrink-0", colors.icon)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", colors.tag)}>
                        {doc.isPublic ? "Visible en perfil" : "Privado"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={getPdfViewUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver documento"
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {doc.fileUrl.toLowerCase().endsWith(".pdf") && (
                    <a
                      href={doc.fileUrl}
                      download
                      title="Descargar PDF"
                      className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === doc.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              ))}

              {/* Formulario de agregar */}
              {isAdding && (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">Subir {config.label}</p>
                    <button type="button" onClick={cancelAdd} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!config.single && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder={config.titlePlaceholder}
                        maxLength={150}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                      />
                    </div>
                  )}

                  <DocumentUpload
                    folder={config.folder}
                    onUploaded={(url) => setNewFileUrl(url)}
                  />

                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={newIsPublic}
                      onChange={(e) => setNewIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded accent-orange-500"
                    />
                    <span className="text-xs text-gray-600">Visible en mi perfil público</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !newFileUrl}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {saving ? "Guardando..." : "Guardar documento"}
                    </button>
                    <button type="button" onClick={cancelAdd} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botón agregar */}
              {!isAdding && canAdd && (
                <button
                  type="button"
                  onClick={() => startAdd(type)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-600 text-sm py-2.5 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {docsOfType.length > 0 && config.single ? "Reemplazar" : "Subir documento"}
                </button>
              )}

              {!isAdding && !canAdd && config.single && docsOfType.length > 0 && (
                <button
                  type="button"
                  onClick={() => startAdd(type)}
                  className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-orange-500 py-1 transition-colors"
                >
                  Reemplazar archivo
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
