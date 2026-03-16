"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import {
  MessageCircle, X, Send, Loader2, CheckCircle2,
  ChevronLeft, Sparkles, Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Rol = "chat" | "contacto" | "enviado"

interface Mensaje {
  rol:       "user" | "assistant"
  texto:     string
  cargando?: boolean
}

// ─── Sugerencias rápidas iniciales ───────────────────────────────────────────

const SUGERENCIAS = [
  "¿Cómo publico una solicitud?",
  "¿Cómo funcionan los créditos?",
  "¿Cómo verifico mi perfil?",
  "No se acreditaron mis créditos",
]

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────

function BurbujaAsistente({ texto, cargando }: { texto: string; cargando?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      {/* Avatar Chamby */}
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm shadow-sm mb-0.5"
        style={{ background: "var(--brand-gradient)" }}>
        ⚡
      </div>
      <div className="max-w-[80%] bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
        {cargando ? (
          <div className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{texto}</p>
        )}
      </div>
    </div>
  )
}

function BurbujaUsuario({ texto }: { texto: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-sm"
        style={{ background: "var(--brand-gradient)" }}>
        <p className="text-xs text-white leading-relaxed">{texto}</p>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SoporteChat() {
  const { user } = useUser()

  const [open,     setOpen]     = useState(false)
  const [pantalla, setPantalla] = useState<Rol>("chat")
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol:   "assistant",
      texto: "¡Hola! 👋 Soy **Chamby**, el asistente de ChambaPe.\n¿En qué te puedo ayudar hoy?",
    },
  ])
  const [input,      setInput]      = useState("")
  const [enviando,   setEnviando]   = useState(false)
  const [streaming,  setStreaming]  = useState(false)

  // Formulario de contacto humano
  const [formNombre,  setFormNombre]  = useState("")
  const [formEmail,   setFormEmail]   = useState("")
  const [formAsunto,  setFormAsunto]  = useState("")
  const [formMensaje, setFormMensaje] = useState("")
  const [formError,   setFormError]   = useState("")
  const [enviandoForm, setEnviandoForm] = useState(false)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  // Pre-llenar form con datos del usuario
  useEffect(() => {
    if (user) {
      setFormNombre(user.fullName ?? "")
      setFormEmail(user.primaryEmailAddress?.emailAddress ?? "")
    }
  }, [user])

  // Focus en input al abrir
  useEffect(() => {
    if (open && pantalla === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, pantalla])

  // ── Enviar mensaje a la IA ────────────────────────────────────────────────

  const enviarMensaje = useCallback(async (textoUsuario: string) => {
    const texto = textoUsuario.trim()
    if (!texto || streaming) return

    setInput("")
    setStreaming(true)

    // Agregar mensaje del usuario
    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { rol: "user", texto },
    ]
    setMensajes(nuevosMensajes)

    // Placeholder "escribiendo…"
    setMensajes((prev) => [...prev, { rol: "assistant", texto: "", cargando: true }])

    try {
      abortRef.current = new AbortController()

      const res = await fetch("/api/soporte/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortRef.current.signal,
        body: JSON.stringify({
          messages: nuevosMensajes.map((m) => ({
            role:    m.rol,
            content: m.texto,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Error al conectar")
      }

      // Leer stream de texto
      const reader = res.body?.getReader()
      if (!reader) throw new Error("Sin stream")

      const decoder = new TextDecoder()
      let respuesta = ""

      // Quitar placeholder "cargando"
      setMensajes((prev) => prev.slice(0, -1))

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        respuesta += decoder.decode(value, { stream: true })

        setMensajes((prev) => {
          const copia = [...prev]
          const ultimo = copia[copia.length - 1]
          if (ultimo?.rol === "assistant") {
            copia[copia.length - 1] = { ...ultimo, texto: respuesta }
          } else {
            copia.push({ rol: "assistant", texto: respuesta })
          }
          return copia
        })
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return
      const msg = err instanceof Error ? err.message : "Error al conectar"
      setMensajes((prev) => {
        const copia = prev.filter((m) => !m.cargando)
        return [...copia, {
          rol:   "assistant",
          texto: `Lo siento, hubo un problema: ${msg}\n\n¿Quieres contactar a soporte directamente? 👇`,
        }]
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [mensajes, streaming])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje(input)
    }
  }

  // ── Enviar formulario de contacto ─────────────────────────────────────────

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    if (!formNombre || !formEmail || !formAsunto || !formMensaje) {
      setFormError("Por favor completa todos los campos.")
      return
    }
    setEnviandoForm(true)
    try {
      const res = await fetch("/api/soporte", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:  formNombre,
          email:   formEmail,
          asunto:  formAsunto,
          mensaje: formMensaje,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al enviar")
      setPantalla("enviado")
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al enviar")
    } finally {
      setEnviandoForm(false)
    }
  }

  function cerrar() {
    abortRef.current?.abort()
    setOpen(false)
  }

  function resetear() {
    setMensajes([{
      rol:   "assistant",
      texto: "¡Hola! 👋 Soy **Chamby**, el asistente de ChambaPe.\n¿En qué te puedo ayudar hoy?",
    }])
    setPantalla("chat")
    setFormAsunto("")
    setFormMensaje("")
    setFormError("")
    setInput("")
  }

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Botón flotante ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir asistente ChambaPe"
        className={cn(
          "fixed bottom-20 right-4 z-50 w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 sm:bottom-6",
          "hover:scale-110 active:scale-95"
        )}
        style={{ width: 52, height: 52, background: open ? "#1f2937" : "var(--brand-gradient)" }}
      >
        <div className={cn("transition-all duration-300", open ? "rotate-90 scale-90" : "rotate-0 scale-100")}>
          {open ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
        </div>
        {/* Badge "nuevo" solo cuando está cerrado */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Panel de chat ── */}
      <div className={cn(
        "fixed right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
        "bottom-36 sm:bottom-20",
        open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      )}
        style={{ height: 520 }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 text-white px-4 py-3 flex items-center gap-3" style={{ background: "var(--brand-gradient)" }}>
          {pantalla !== "chat" && (
            <button
              onClick={() => setPantalla("chat")}
              className="p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-lg">
            ⚡
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold leading-tight">Chamby</p>
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
            <p className="text-[11px] text-white/75">Asistente IA · ChambaPe</p>
          </div>

          {/* Botón contacto humano */}
          {pantalla === "chat" && (
            <button
              onClick={() => setPantalla("contacto")}
              title="Hablar con soporte humano"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors px-2.5 py-1.5 rounded-xl text-[11px] font-medium shrink-0"
            >
              <Phone className="w-3 h-3" />
              Soporte
            </button>
          )}

          <button
            onClick={cerrar}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Pantalla: Chat IA ── */}
        {pantalla === "chat" && (
          <>
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
              {mensajes.map((m, i) => (
                m.rol === "assistant"
                  ? <BurbujaAsistente key={i} texto={m.texto} cargando={m.cargando} />
                  : <BurbujaUsuario   key={i} texto={m.texto} />
              ))}

              {/* Sugerencias solo al inicio (1 mensaje = bienvenida) */}
              {mensajes.length === 1 && !streaming && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => enviarMensaje(s)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  rows={1}
                  disabled={streaming}
                  className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors bg-gray-50 disabled:opacity-60"
                  style={{ maxHeight: 80, overflowY: "auto" }}
                />
                <button
                  onClick={() => enviarMensaje(input)}
                  disabled={!input.trim() || streaming}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  {streaming
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-gray-300 text-center mt-1.5">
                IA · Respuestas automáticas — puede cometer errores
              </p>
            </div>
          </>
        )}

        {/* ── Pantalla: Formulario de contacto humano ── */}
        {pantalla === "contacto" && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              <div className="text-center pt-2 pb-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl mx-auto mb-3">
                  📩
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Contactar soporte humano</h3>
                <p className="text-xs text-gray-500 mt-0.5">Te responderemos en menos de 24 horas</p>
              </div>

              <form onSubmit={enviarFormulario} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Tu nombre</label>
                    <input
                      type="text" value={formNombre} onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-orange-400 placeholder-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Tu email</label>
                    <input
                      type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="correo@email.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-orange-400 placeholder-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-medium block mb-1">Asunto</label>
                  <input
                    type="text" value={formAsunto} onChange={(e) => setFormAsunto(e.target.value)}
                    placeholder="Ej: Problema con créditos"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-orange-400 placeholder-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-medium block mb-1">Mensaje</label>
                  <textarea
                    value={formMensaje} onChange={(e) => setFormMensaje(e.target.value)}
                    placeholder="Describe tu problema con el mayor detalle posible..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-orange-400 placeholder-gray-300 resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviandoForm}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-60 transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  {enviandoForm
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</>
                    : <><Send className="w-3.5 h-3.5" /> Enviar mensaje</>
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Pantalla: Éxito ── */}
        {pantalla === "enviado" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">¡Mensaje enviado! 🎉</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                El equipo de ChambaPe revisará tu mensaje y te responderá a tu email en menos de 24 horas.
              </p>
            </div>
            <button
              onClick={resetear}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "var(--brand-gradient)" }}
            >
              Volver al chat ✨
            </button>
          </div>
        )}
      </div>
    </>
  )
}
