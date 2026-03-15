"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Trash2, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Props {
  onRecordingComplete: (url: string, duration: number) => void
  onCancel: () => void
  disabled?: boolean
}

export function VoiceRecorder({ onRecordingComplete, onCancel, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        if (audioBlob.size < 100) return // Demasiado corto o vacío

        await uploadAudio(audioBlob)
        
        // Detener todos los tracks para liberar el micrófono
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error(err)
      toast.error("No se pudo acceder al micrófono")
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function cancelRecording() {
    if (isRecording) {
      mediaRecorderRef.current!.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
    onCancel()
  }

  async function uploadAudio(blob: Blob) {
    setIsUploading(true)
    try {
      const file = new File([blob], "voice-message.webm", { type: "audio/webm" })
      
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          folder: "mensajes", 
          ext: "webm",
          resourceType: "video" // Cloudinary usa video para audios
        }),
      })
      if (!sigRes.ok) throw new Error("Error obteniendo firma")
      const sigData = await sigRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("signature", sigData.signature)
      formData.append("timestamp", String(sigData.timestamp))
      formData.append("api_key", sigData.apiKey)
      formData.append("folder", sigData.folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`,
        { method: "POST", body: formData }
      )
      if (!uploadRes.ok) throw new Error("Error subiendo audio")
      
      const uploadData = await uploadRes.json()
      onRecordingComplete(uploadData.secure_url, duration)
    } catch (err) {
      console.error(err)
      toast.error("Error al enviar el audio")
    } finally {
      setIsUploading(false)
    }
  }

  function formatDuration(s: number) {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  if (isUploading) {
    return (
      <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 animate-pulse">
        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
        <span className="text-sm font-medium text-orange-700">Enviando nota de voz...</span>
      </div>
    )
  }

  if (isRecording) {
    return (
      <div className="flex-1 flex items-center justify-between gap-4 px-4 py-2 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-gray-700 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
        
        <div className="flex-1 h-1 bg-orange-200 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-red-400/20 animate-wiggle" />
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={cancelRecording}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            type="button" 
            onClick={stopRecording}
            className="bg-orange-500 p-2 rounded-full text-white hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-orange-500 flex items-center justify-center flex-shrink-0 transition-colors"
      title="Grabar nota de voz"
    >
      <Mic className="w-5 h-5" />
    </button>
  )
}
