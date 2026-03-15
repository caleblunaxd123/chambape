"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, Coins, AlertCircle, CheckCircle2, Loader2, Wallet, Lightbulb } from "lucide-react"
import { formatSoles } from "@/lib/utils"
import Link from "next/link"

interface AplicarModalProps {
  solicitudId: string
  solicitudTitle: string
  categoriaSlug: string
  creditCost: number
  currentCredits: number
  onClose: () => void
  onSuccess: (newBalance: number) => void
}

export function AplicarModal({
  solicitudId,
  solicitudTitle,
  creditCost,
  currentCredits,
  onClose,
  onSuccess,
}: AplicarModalProps) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [proposedBudget, setProposedBudget] = useState("")
  const [estimatedDays, setEstimatedDays] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const canApply = currentCredits >= creditCost
  const messageOk = message.trim().length >= 30

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!messageOk || loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}/aplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          proposedBudget: proposedBudget ? Math.round(parseFloat(proposedBudget)) : undefined,
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? "Error al enviar la propuesta")
        return
      }

      setSuccess(true)
      onSuccess(json.newBalance)
      router.refresh()
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Enviar propuesta</h2>
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{solicitudTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          // Success state
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">¡Propuesta enviada!</h3>
              <p className="text-sm text-gray-500 mt-1">
                El cliente recibirá una notificación y podrá ver tu perfil.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Credits info */}
            <div
              className={`flex items-center justify-between rounded-xl p-3 text-sm ${
                canApply
                  ? "bg-orange-50 border border-orange-100"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins
                  className={`w-4 h-4 ${canApply ? "text-orange-500" : "text-red-500"}`}
                />
                <span className={canApply ? "text-orange-700" : "text-red-700"}>
                  Esta aplicación cuesta{" "}
                  <strong>{creditCost} créditos</strong>
                </span>
              </div>
              <span
                className={`font-semibold ${
                  canApply ? "text-orange-600" : "text-red-600"
                }`}
              >
                Tienes {currentCredits}
              </span>
            </div>

            {!canApply && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  No tienes suficientes créditos.{" "}
                  <Link href="/profesional/creditos" className="underline font-medium">
                    Recarga aquí
                  </Link>
                </span>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tu propuesta <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe cómo puedes ayudar, tu experiencia en este tipo de trabajo, disponibilidad y cualquier detalle relevante..."
                rows={4}
                maxLength={1000}
                disabled={!canApply}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50 disabled:bg-gray-50"
              />
              <div className="flex justify-between mt-1">
                <span
                  className={`text-xs ${
                    message.length < 30 && message.length > 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {message.length < 30
                    ? `Mínimo ${30 - message.length} caracteres más`
                    : "✓ Longitud correcta"}
                </span>
                <span className="text-xs text-gray-400">{message.length}/1000</span>
              </div>
            </div>

            {/* Presupuesto propuesto — campo clave, bien visible */}
            <div className="rounded-xl border-2 border-amber-100 bg-amber-50/50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <Wallet className="w-4 h-4 text-amber-500" />
                  Tu precio por este trabajo
                </label>
                <span className="text-[11px] text-gray-400 font-normal">opcional</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">
                  S/.
                </span>
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  disabled={!canApply}
                  className="w-full text-lg font-bold border-2 border-amber-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-amber-700">
                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>El cliente ve tu precio <strong>antes</strong> de elegirte. Ingresar un precio aumenta tus chances.</span>
              </div>
            </div>

            {/* Días estimados */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Días estimados para completar{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="Ej: 2"
                min="1"
                max="365"
                disabled={!canApply}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canApply || !messageOk || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    Aplicar ({creditCost} créditos)
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
