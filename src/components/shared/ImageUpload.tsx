"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CloudinaryFolder =
  | "avatares"
  | "dniFrente"
  | "dniReverso"
  | "selfieDni"
  | "portfolio"
  | "solicitudes"

interface ImageUploadProps {
  folder: CloudinaryFolder
  value?: string            // URL actual (si ya hay imagen)
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  hint?: string
  aspectRatio?: "square" | "portrait" | "landscape"
  maxSizeMB?: number
  className?: string
  onResult?: (result: any) => void // Para pasar datos extra (como OCR)
}

export function ImageUpload({
  folder,
  value,
  onChange,
  onRemove,
  label,
  hint,
  aspectRatio = "square",
  maxSizeMB = 5,
  className,
  onResult,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value ?? null)

  const aspectClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  }[aspectRatio]

  async function handleFile(file: File) {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP)")
      return
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${maxSizeMB}MB`)
      return
    }

    setLoading(true)

    try {
      // 1. Obtener firma de Cloudinary desde nuestro servidor
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      })

      if (!sigRes.ok) {
        const msg = await sigRes.text()
        throw new Error(msg || "No se pudo obtener la firma de upload")
      }

      const { signature, timestamp, folder: folderPath, cloudName, apiKey, ocr } = await sigRes.json()

      // 2. Subir directamente a Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("signature", signature)
      formData.append("timestamp", String(timestamp))
      formData.append("folder", folderPath)
      formData.append("api_key", apiKey)
      if (ocr) formData.append("ocr", ocr)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      )

      if (!uploadRes.ok) throw new Error("Error al subir la imagen")

      const result = await uploadRes.json()
      const secureUrl: string = result.secure_url

      setPreview(secureUrl)
      onChange(secureUrl)
      if (onResult) onResult(result)
      toast.success("Imagen subida correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input para permitir subir el mismo archivo de nuevo
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    setPreview(null)
    onRemove?.()
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      <div
        className={cn("relative w-full rounded-xl overflow-hidden border-2", aspectClass,
          loading && "opacity-70 pointer-events-none",
          preview ? "border-gray-200" : "border-dashed border-gray-300 hover:border-orange-400 bg-gray-50/50 transition-colors"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Imagen subida"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Overlay de acciones */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors group flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              >
                <Upload className="w-4 h-4 mr-1" /> Cambiar
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); handleRemove() }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500 p-4">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Button 
                  type="button" 
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 bg-white text-gray-800 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 shadow-sm"
                >
                  <Camera className="w-4 h-4 mr-2 text-orange-500" />
                  Tomar foto
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Galería
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture={folder === "selfieDni" ? "user" : "environment"}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
