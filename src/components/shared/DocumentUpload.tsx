"use client"

import { useRef, useState } from "react"
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type DocumentFolder = "documentos" | "certificados"

interface Props {
  folder: DocumentFolder
  onUploaded: (url: string, fileName: string) => void
  accept?: string
  hint?: string
  className?: string
}

export function DocumentUpload({ folder, onUploaded, accept = "application/pdf,image/*", hint, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState<string | null>(null)

  async function handleFile(file: File) {
    const maxMB = 10
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`El archivo no debe superar ${maxMB}MB`)
      return
    }

    setLoading(true)
    try {
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      })
      if (!sigRes.ok) throw new Error(await sigRes.text())

      const { signature, timestamp, folder: folderPath, cloudName, apiKey, resourceType } = await sigRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("signature", signature)
      formData.append("timestamp", String(timestamp))
      formData.append("folder", folderPath)
      formData.append("api_key", apiKey)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType ?? "auto"}/upload`,
        { method: "POST", body: formData }
      )
      if (!uploadRes.ok) throw new Error("Error al subir el archivo")

      const result = await uploadRes.json()
      const url: string = result.secure_url
      setUploaded(file.name)
      onUploaded(url, file.name)
      toast.success("Archivo subido correctamente")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
          loading ? "opacity-60 pointer-events-none" : "hover:border-orange-400 hover:bg-orange-50/50",
          uploaded ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
        )}
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        ) : uploaded ? (
          <>
            <CheckCircle2 className="w-7 h-7 text-green-500" />
            <p className="text-sm font-medium text-green-700 text-center line-clamp-1">{uploaded}</p>
            <p className="text-xs text-green-600">Subido correctamente · Haz clic para cambiar</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Haz clic para subir
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG · Máx 10MB</p>
            </div>
          </>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
      />
    </div>
  )
}
