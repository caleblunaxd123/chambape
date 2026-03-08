"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldOff, ShieldCheck, Loader2 } from "lucide-react"

interface Props {
  profesionalId: string
  currentStatus: string
}

export function AdminEstadoActions({ profesionalId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [reason, setReason] = useState("")

  const isSuspended = currentStatus === "SUSPENDED"

  async function handleActivar() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/profesionales/${profesionalId}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al reactivar")
        return
      }
      toast.success("Cuenta reactivada. El profesional fue notificado.")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleSuspender() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/profesionales/${profesionalId}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend", reason: reason.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al suspender")
        return
      }
      toast.success("Cuenta suspendida. El profesional fue notificado.")
      setShowSuspendForm(false)
      setReason("")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (isSuspended) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-red-500" />
          <h2 className="text-base font-semibold text-red-800">Cuenta suspendida</h2>
        </div>
        <p className="text-sm text-red-600">
          Este profesional no puede acceder ni aplicar a solicitudes.
        </p>
        <button
          onClick={handleActivar}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          Reactivar cuenta
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <ShieldOff className="w-4 h-4 text-gray-400" />
        <h2 className="text-base font-semibold text-gray-900">Suspender cuenta</h2>
      </div>

      {!showSuspendForm ? (
        <button
          onClick={() => setShowSuspendForm(true)}
          className="flex items-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 text-red-600 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          <ShieldOff className="w-4 h-4" />
          Dar de baja (suspender)
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Incumplimiento de normas, quejas reiteradas, etc."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSuspender}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar suspensión
            </button>
            <button
              onClick={() => { setShowSuspendForm(false); setReason("") }}
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
