"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Coins, Loader2, Plus, Minus } from "lucide-react"

interface Props {
  profesionalId: string
  currentCredits: number
}

export function AdminCreditosActions({ profesionalId, currentCredits }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const parsed = parseInt(amount)
    if (!parsed || parsed <= 0) {
      toast.error("Ingresa una cantidad válida mayor a 0")
      return
    }
    if (!reason.trim()) {
      toast.error("Ingresa un motivo")
      return
    }

    const delta = mode === "add" ? parsed : -parsed

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/profesionales/${profesionalId}/creditos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: delta, reason: reason.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al actualizar créditos")
        return
      }
      toast.success(
        mode === "add"
          ? `+${parsed} créditos añadidos. Nuevo saldo: ${json.newBalance}`
          : `-${parsed} créditos descontados. Nuevo saldo: ${json.newBalance}`
      )
      setAmount("")
      setReason("")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-400" />
          <h2 className="text-base font-semibold text-gray-900">Gestionar créditos</h2>
        </div>
        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          {currentCredits} créditos actuales
        </span>
      </div>

      {/* Toggle add/remove */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          onClick={() => setMode("add")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
            mode === "add"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir
        </button>
        <button
          onClick={() => setMode("remove")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
            mode === "remove"
              ? "bg-red-500 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Minus className="w-3.5 h-3.5" />
          Quitar
        </button>
      </div>

      {/* Amount presets */}
      <div className="flex gap-2 flex-wrap">
        {[5, 10, 20, 50].map((n) => (
          <button
            key={n}
            onClick={() => setAmount(String(n))}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              amount === String(n)
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {n}
          </button>
        ))}
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Otro..."
          className="w-20 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
        />
      </div>

      {/* Reason */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">
          Motivo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Créditos de bienvenida, compensación por error, etc."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !amount || !reason.trim()}
        className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm ${
          mode === "add"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : mode === "add" ? (
          <Plus className="w-4 h-4" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
        {mode === "add" ? "Añadir créditos" : "Quitar créditos"}
      </button>
    </div>
  )
}
