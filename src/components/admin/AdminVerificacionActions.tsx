"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface Props {
  profesionalId: string
  userId: string
}

export function AdminVerificacionActions({ profesionalId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [motivo, setMotivo] = useState("")

  async function handleAprobar() {
    setLoading("approve")
    try {
      const res = await fetch(`/api/admin/profesionales/${profesionalId}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al aprobar")
        return
      }
      toast.success("Profesional verificado y activado ✓")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(null)
    }
  }

  async function handleRechazar() {
    if (!motivo.trim()) {
      toast.error("Ingresa un motivo de rechazo")
      return
    }
    setLoading("reject")
    try {
      const res = await fetch(`/api/admin/profesionales/${profesionalId}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", motivo }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al rechazar")
        return
      }
      toast.success("Verificación rechazada. El profesional fue notificado.")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
      <h2 className="text-base font-semibold text-amber-900">Acción de verificación</h2>
      <p className="text-sm text-amber-700">
        Revisa los documentos de identidad antes de tomar una decisión.
        Al aprobar, el profesional recibirá 5 créditos de bienvenida y podrá aplicar a solicitudes.
      </p>

      {!showRejectForm ? (
        <div className="flex gap-3">
          <button
            onClick={handleAprobar}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading === "approve" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Aprobar y activar
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 disabled:opacity-50 text-red-600 font-semibold py-3 rounded-xl transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Las fotos del DNI están borrosas. Por favor sube fotos más claras."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRechazar}
              disabled={loading !== null || !motivo.trim()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading === "reject" && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar rechazo
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
