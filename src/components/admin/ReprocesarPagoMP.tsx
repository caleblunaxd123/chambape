"use client"

import { useState } from "react"
import { Wrench, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface Result {
  ok: boolean
  message: string
  profesional?: string
  email?: string
  creditsAdded?: number
  newBalance?: number
  paquete?: string
  monto?: string
  alreadyProcessed?: boolean
  error?: string
}

export default function ReprocesarPagoMP() {
  const [paymentId, setPaymentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentId.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/creditos/reprocesar-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: paymentId.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ ok: false, message: "Error de conexión", error: "Error de red" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
          <Wrench className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Reprocesar pago MP</h2>
          <p className="text-xs text-gray-400">Acredita manualmente un pago aprobado que no se registró (ej. notification_url apuntaba a localhost)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          placeholder="Payment ID de MercadoPago (ej. 123456789)"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !paymentId.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
          Acreditar
        </button>
      </form>

      {result && (
        <div className={`mt-3 rounded-lg p-3 text-sm flex items-start gap-2 ${result.ok ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
          {result.ok ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`font-semibold ${result.ok ? "text-green-800" : "text-red-700"}`}>
              {result.message ?? result.error}
            </p>
            {result.ok && result.creditsAdded && (
              <ul className="text-xs text-green-700 mt-1 space-y-0.5">
                <li>Profesional: <strong>{result.profesional}</strong> ({result.email})</li>
                <li>Paquete: <strong>{result.paquete}</strong> · {result.monto}</li>
                <li>Créditos añadidos: <strong>+{result.creditsAdded}</strong> → saldo nuevo: <strong>{result.newBalance}</strong></li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
