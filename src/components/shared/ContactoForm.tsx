"use client"

import { useState } from "react"
import { Loader2, Send, CheckCircle2 } from "lucide-react"

export function ContactoForm() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [asunto, setAsunto] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setEnviando(true)
    try {
      const res = await fetch("/api/soporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al enviar")
      setEnviado(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar")
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center py-12 bg-orange-50/50 rounded-3xl border border-orange-100">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">¡Mensaje enviado! 🎉</h3>
          <p className="text-sm text-slate-500 mt-1">Te responderemos a tu email en menos de 24 horas.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Tu nombre</label>
          <input
            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
            placeholder="Nombre completo"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-orange-400 placeholder-slate-300"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Tu email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="correo@email.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-orange-400 placeholder-slate-300"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 font-medium block mb-1">Asunto</label>
        <input
          type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} required
          placeholder="¿En qué te podemos ayudar?"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-orange-400 placeholder-slate-300"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 font-medium block mb-1">Mensaje</label>
        <textarea
          value={mensaje} onChange={(e) => setMensaje(e.target.value)} required
          placeholder="Describe tu consulta con el mayor detalle posible..."
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-orange-400 placeholder-slate-300 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--brand-gradient)" }}
      >
        {enviando
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          : <><Send className="w-4 h-4" /> Enviar mensaje</>
        }
      </button>
    </form>
  )
}
