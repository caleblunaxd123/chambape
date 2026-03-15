"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Send, Loader2, Paperclip, FileText, X, ArrowLeft, Smile, FileImage, File } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { DocumentUpload } from "@/components/shared/DocumentUpload"

// ── Sticker sets ──────────────────────────────────────────────
const STICKER_SETS = [
  { label: "Caras", emojis: ["😀","😂","🥹","😍","🤩","😎","🥳","😴","🤔","😤","😢","😭","😱","🤗","😏","🙃"] },
  { label: "Gestos", emojis: ["👍","👎","👏","🙌","🤝","🫶","🤜","💪","🙏","✌️","🤞","👌","🫡","🤙","👋","🫰"] },
  { label: "Trabajo", emojis: ["🔧","🛠️","🎨","🧹","🔑","⚡","🚿","🪣","🧰","📋","🔨","🪚","🧲","🔩","🪜","🏗️"] },
  { label: "Extras", emojis: ["❤️","🔥","✅","💯","🎉","⭐","💰","🏆","⏰","🆗","📌","🚀","💡","🎯","📞","📸"] },
]

// ── File type helpers ─────────────────────────────────────────
type FileKind = "image" | "pdf" | "word" | "other"

function getFileKind(fileName: string | null, fileUrl: string | null): FileKind {
  // Intentar detectar por fileName primero (más confiable, tiene extensión original)
  const name = fileName ?? ""
  const urlName = fileUrl ?? ""
  const ext = (name || urlName).split(".").pop()?.toLowerCase() ?? ""
  if (["jpg","jpeg","png","webp","gif"].includes(ext)) return "image"
  if (ext === "pdf") return "pdf"
  if (["doc","docx"].includes(ext)) return "word"
  // Sin extensión pero en /raw/upload/ → probablemente PDF (documentos/certificados)
  if (urlName.includes("/raw/upload/") && !ext) return "pdf"
  return "other"
}

// fl_attachment causa ERR_INVALID_RESPONSE para PDFs en Cloudinary image type.
// Usar la URL directa: Cloudinary sirve el PDF con Content-Type: application/pdf.
function getDownloadUrl(fileUrl: string): string {
  return fileUrl
}

function FileBubble({ fileUrl, fileName, isMe }: { fileUrl: string; fileName: string | null; isMe: boolean }) {
  const kind = getFileKind(fileName, fileUrl)

  if (kind === "image") {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={fileUrl}
          alt={fileName ?? "imagen"}
          className="max-w-[220px] rounded-xl object-cover border border-white/20 shadow-sm hover:opacity-90 transition-opacity"
          style={{ maxHeight: 220 }}
        />
      </a>
    )
  }

  const iconBg = isMe ? "bg-white/20" : kind === "pdf" ? "bg-red-50" : kind === "word" ? "bg-blue-50" : "bg-gray-100"
  const icon = kind === "pdf"
    ? <span className="text-xl leading-none">📄</span>
    : kind === "word"
    ? <span className="text-xl leading-none">📝</span>
    : <File className="w-5 h-5 text-gray-500" />

  const labelMap: Record<FileKind, string> = { image: "Imagen", pdf: "PDF", word: "Word", other: "Archivo" }

  const href = (kind === "pdf" || kind === "word" || kind === "other") ? getDownloadUrl(fileUrl) : fileUrl

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-colors",
        isMe
          ? "bg-orange-400/80 text-white hover:bg-orange-400 rounded-br-md"
          : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm rounded-bl-md"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate max-w-[140px] font-medium text-sm">{fileName ?? "Archivo"}</p>
        <p className={cn("text-xs mt-0.5", isMe ? "text-orange-100" : "text-gray-400")}>{labelMap[kind]}</p>
      </div>
    </a>
  )
}

// ── Tipos ─────────────────────────────────────────────────────
interface MessageSender { id: string; name: string; avatarUrl: string | null }
interface ChatMessage {
  id: string; content: string | null; fileUrl: string | null
  fileType: string | null; fileName: string | null
  createdAt: string; readAt: string | null; sender: MessageSender
}
interface Props {
  conversationId: string; currentUserId: string
  otherUser: { id: string; name: string; avatarUrl: string | null }
  initialMessages: ChatMessage[]; backHref: string
}

// ── Componente principal ──────────────────────────────────────
export function ChatWindow({ conversationId, currentUserId, otherUser, initialMessages, backHref }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [showStickers, setShowStickers] = useState(false)
  const [stickerTab, setStickerTab] = useState(0)
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastCreatedAt = useRef<string>(initialMessages.at(-1)?.createdAt ?? new Date(0).toISOString())

  function scrollToBottom(smooth = true) {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  useEffect(() => { scrollToBottom(false) }, [])
  useEffect(() => { scrollToBottom() }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px"
  }, [text])

  // Polling cada 4 segundos
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}/messages?since=${encodeURIComponent(lastCreatedAt.current)}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.messages.length > 0) {
        lastCreatedAt.current = data.messages.at(-1).createdAt
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newOnes = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id))
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev
        })
      }
    } catch {}
  }, [conversationId])

  useEffect(() => {
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [poll])

  async function sendMessage(overrideContent?: string) {
    const content = overrideContent ?? text.trim()
    if (!content && !pendingFile) return
    setSending(true)
    try {
      const body: Record<string, unknown> = {}
      if (content) body.content = content
      if (pendingFile) {
        body.fileUrl = pendingFile.url
        body.fileName = pendingFile.name
        const ext = pendingFile.name.split(".").pop()?.toLowerCase()
        body.fileType = ext === "pdf" ? "PDF"
          : ext?.match(/jpg|jpeg|png|webp|gif/) ? "IMAGE"
          : "OTHER"
      }

      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error("Error al enviar"); return }

      const newMsg: ChatMessage = await res.json()
      lastCreatedAt.current = newMsg.createdAt
      setMessages((prev) => [...prev, newMsg])
      if (!overrideContent) setText("")
      setPendingFile(null)
      setShowAttach(false)
      setShowStickers(false)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSending(false)
    }
  }

  function sendSticker(emoji: string) {
    setShowStickers(false)
    sendMessage(emoji)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return "Hoy"
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return "Ayer"
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
  }

  // Agrupar por fecha
  const grouped: { date: string; msgs: ChatMessage[] }[] = []
  for (const msg of messages) {
    const date = formatDate(msg.createdAt)
    const last = grouped.at(-1)
    if (last?.date === date) last.msgs.push(msg)
    else grouped.push({ date, msgs: [msg] })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button type="button" onClick={() => router.push(backHref)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-100 flex-shrink-0">
          {otherUser.avatarUrl ? (
            <Image src={otherUser.avatarUrl} alt={otherUser.name} width={36} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm">
              {getInitials(otherUser.name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{otherUser.name}</p>
          <p className="text-xs text-green-500 font-medium">En línea</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-400 font-medium">Inicia la conversación</p>
            <p className="text-xs text-gray-300 mt-1">Los mensajes son privados entre tú y {otherUser.name.split(" ")[0]}</p>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-1.5">
              {msgs.map((msg, i) => {
                const isMe = msg.sender.id === currentUserId
                const prevSame = i > 0 && msgs[i - 1].sender.id === msg.sender.id
                // Sticker: solo emoji (1-2 chars), sin archivo
                const isSticker = !!msg.content && !msg.fileUrl &&
                  [...msg.content].length <= 2 &&
                  /\p{Emoji}/u.test(msg.content)

                return (
                  <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                    {/* Avatar */}
                    <div className={cn("w-7 h-7 rounded-full flex-shrink-0", prevSame && "invisible")}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100">
                          {msg.sender.avatarUrl ? (
                            <Image src={msg.sender.avatarUrl} alt={msg.sender.name} width={28} height={28} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
                              {getInitials(msg.sender.name)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className={cn("max-w-[75%] space-y-1 flex flex-col", isMe ? "items-end" : "items-start")}>
                      {isSticker ? (
                        <span className="text-5xl leading-none select-none">{msg.content}</span>
                      ) : (
                        <>
                          {msg.content && (
                            <div className={cn(
                              "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                              isMe
                                ? "bg-orange-500 text-white rounded-br-md"
                                : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-md"
                            )}>
                              {msg.content}
                            </div>
                          )}
                          {msg.fileUrl && (
                            <FileBubble fileUrl={msg.fileUrl} fileName={msg.fileName} isMe={isMe} />
                          )}
                        </>
                      )}

                      <span className={cn("text-[10px] text-gray-400 px-1", isMe && "text-right")}>
                        {formatTime(msg.createdAt)}
                        {isMe && msg.readAt && " ✓✓"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Archivo pendiente preview */}
      {pendingFile && (
        <div className="bg-orange-50 border-t border-orange-100 px-4 py-2 flex items-center gap-2">
          {getFileKind(pendingFile.name, pendingFile.url) === "image" ? (
            <FileImage className="w-4 h-4 text-orange-500 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
          )}
          <span className="text-sm text-orange-700 truncate flex-1">{pendingFile.name}</span>
          <button type="button" onClick={() => setPendingFile(null)} className="text-orange-400 hover:text-orange-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload adjunto */}
      {showAttach && !pendingFile && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">Adjuntar archivo (PDF, imagen, Word)</p>
          <DocumentUpload
            folder="documentos"
            onUploaded={(url, name) => {
              setPendingFile({ url, name })
              setShowAttach(false)
            }}
            hint="Antecedentes, CV, foto de trabajo, contrato, etc."
            maxMB={5}
          />
        </div>
      )}

      {/* Sticker picker */}
      {showStickers && (
        <div className="bg-white border-t border-gray-100 shadow-lg">
          <div className="flex border-b border-gray-100 px-3 pt-2">
            {STICKER_SETS.map((set, i) => (
              <button
                key={set.label}
                type="button"
                onClick={() => setStickerTab(i)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors",
                  stickerTab === i ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {set.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1 p-3 max-h-36 overflow-y-auto">
            {STICKER_SETS[stickerTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => sendSticker(emoji)}
                disabled={sending}
                className="text-2xl w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-end gap-2">
        <button
          type="button"
          onClick={() => { setShowAttach((v) => !v); setShowStickers(false) }}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
            showAttach ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          )}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => { setShowStickers((v) => !v); setShowAttach(false) }}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
            showStickers ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          )}
        >
          <Smile className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe un mensaje..."
          rows={1}
          maxLength={2000}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 resize-none min-h-[40px] max-h-32 overflow-y-auto"
          style={{ lineHeight: "1.4" }}
        />

        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={sending || (!text.trim() && !pendingFile)}
          className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
