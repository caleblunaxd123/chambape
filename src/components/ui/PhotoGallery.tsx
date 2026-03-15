"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoGalleryProps {
  photos: string[]
  label?: string
}

export function PhotoGallery({ photos, label }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)
    }
  }

  if (photos.length === 0) return null

  return (
    <>
      {label && <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</h3>}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide">
        {photos.map((url, i) => (
          <div
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm cursor-zoom-in hover:border-orange-300 transition-all"
          >
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button 
                className="absolute left-4 sm:left-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all transform hover:scale-110 z-[110]"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                className="absolute right-4 sm:right-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all transform hover:scale-110 z-[110]"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image
                src={photos[selectedIndex]}
                alt={`Foto ampliada ${selectedIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
