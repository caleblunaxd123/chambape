"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface LightboxImage {
  url: string
  caption?: string | null
}

interface Props {
  images: LightboxImage[]
  className?: string
}

export function PortfolioLightbox({ images, className }: Props) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length])
  const next = useCallback(() => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, prev, next])

  // Bloquear scroll al abrir
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  function openAt(idx: number) {
    setCurrent(idx)
    setOpen(true)
  }

  if (images.length === 0) return null

  return (
    <>
      {/* Grid de miniaturas */}
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2", className)}>
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openAt(idx)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Image
              src={img.url}
              alt={img.caption ?? `Trabajo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {/* Overlay con ícono zoom */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white line-clamp-1">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Contenedor imagen — evita cerrar al hacer click dentro */}
          <div
            className="relative max-w-4xl w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen principal */}
            <div className="relative w-full" style={{ maxHeight: "80vh" }}>
              <div className="relative w-full h-[70vh]">
                <Image
                  src={images[current].url}
                  alt={images[current].caption ?? `Trabajo ${current + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            {/* Caption */}
            {images[current].caption && (
              <p className="mt-3 text-sm text-white/80 text-center px-4">
                {images[current].caption}
              </p>
            )}

            {/* Contador */}
            <p className="mt-2 text-xs text-white/50">
              {current + 1} / {images.length}
            </p>

            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrent(idx)}
                    className={cn(
                      "relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                      idx === current ? "border-orange-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flechas nav */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
