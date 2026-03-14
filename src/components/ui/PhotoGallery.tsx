"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface PhotoLightboxProps {
  photos: string[]
  initialIndex?: number
  onClose: () => void
}

function PhotoLightbox({ photos, initialIndex = 0, onClose }: PhotoLightboxProps) {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % photos.length)
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + photos.length) % photos.length)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose, photos.length])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Contador */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-bold bg-black/40 px-3 py-1 rounded-full">
          {current + 1} / {photos.length}
        </div>
      )}

      {/* Imagen */}
      <div
        className="relative w-full max-w-3xl max-h-[80vh] aspect-square sm:aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[current]}
          alt={`Foto ${current + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      {/* Navegación */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}

interface PhotoGalleryProps {
  photos: string[]
  label?: string
}

export function PhotoGallery({ photos, label = "Fotos adjuntas" }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <div>
      {label && (
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{label}</h3>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm group cursor-zoom-in"
          >
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
