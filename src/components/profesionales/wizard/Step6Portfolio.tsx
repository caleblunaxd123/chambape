"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle, Plus, X, Trophy } from "lucide-react"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PortfolioItem {
  url: string
  caption?: string
}

interface Props {
  defaultImages?: PortfolioItem[]
  onNext: (data: { portfolioImages: PortfolioItem[] }) => Promise<void>
  loading: boolean
}

const MAX_FOTOS = 5

export function Step6Portfolio({ defaultImages = [], onNext, loading }: Props) {
  const [images, setImages] = useState<PortfolioItem[]>(defaultImages)
  const [captions, setCaptions] = useState<string[]>(defaultImages.map((i) => i.caption ?? ""))

  function addSlot() {
    if (images.length >= MAX_FOTOS) return
    setImages((prev) => [...prev, { url: "" }])
    setCaptions((prev) => [...prev, ""])
  }

  function updateUrl(index: number, url: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, url } : img)))
  }

  function updateCaption(index: number, caption: string) {
    setCaptions((prev) => prev.map((c, i) => (i === index ? caption : c)))
  }

  function removeSlot(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setCaptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleFinalizar() {
    const validImages = images
      .map((img, i) => ({ url: img.url, caption: captions[i] || undefined }))
      .filter((img) => img.url)

    await onNext({ portfolioImages: validImages })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Agrega fotos de tus mejores trabajos. ¡Los clientes confían más en quienes muestran su trabajo!
      </p>

      {/* Grilla de fotos */}
      <div className="space-y-4">
        {images.map((img, index) => (
          <div key={index} className="relative rounded-xl border border-gray-200 p-3 space-y-2">
            {/* Botón eliminar slot */}
            <button
              type="button"
              onClick={() => removeSlot(index)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <p className="text-xs font-medium text-gray-500">Foto {index + 1}</p>

            <ImageUpload
              folder="portfolio"
              aspectRatio="landscape"
              value={img.url || undefined}
              onChange={(url) => updateUrl(index, url)}
              onRemove={() => updateUrl(index, "")}
              hint="JPG o PNG, máx. 5MB"
            />

            {img.url && (
              <Input
                placeholder="Descripción (opcional): ej. Instalación eléctrica en Miraflores"
                value={captions[index] ?? ""}
                onChange={(e) => updateCaption(index, e.target.value)}
                maxLength={100}
                className="text-sm"
              />
            )}
          </div>
        ))}

        {/* Agregar foto */}
        {images.length < MAX_FOTOS && (
          <button
            type="button"
            onClick={addSlot}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar foto ({images.length}/{MAX_FOTOS})
          </button>
        )}
      </div>

      {/* Botón de finalizar */}
      <div className="space-y-2">
        <Button
          type="button"
          onClick={handleFinalizar}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
        >
          {loading ? "Finalizando..." : "Finalizar registro"}
          {!loading && <CheckCircle className="ml-2 w-4 h-4" />}
        </Button>

        {images.filter((i) => i.url).length === 0 && (
          <p className="text-xs text-center text-gray-400">
            Puedes omitir este paso y agregar fotos más adelante desde tu perfil
          </p>
        )}
      </div>
    </div>
  )
}
