"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  defaultSelected?: string[]   // IDs de categorías de la BD
  categoryMap: Record<string, string>  // slug → id (de la BD)
  onNext: (data: { categoryIds: string[] }) => Promise<void>
  loading: boolean
}

export function Step2Especialidades({ defaultSelected = [], categoryMap, onNext, loading }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)

  function toggle(slug: string) {
    const id = categoryMap[slug]
    if (!id) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSubmit() {
    if (selected.length === 0) {
      toast.error("Selecciona al menos una especialidad")
      return
    }
    onNext({ categoryIds: selected })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Selecciona los servicios que ofreces. Puedes elegir más de uno.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIAS.map((cat) => {
          const id = categoryMap[cat.slug]
          const isSelected = id ? selected.includes(id) : false

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggle(cat.slug)}
              className={cn(
                "relative text-left rounded-xl border-2 p-3 transition-all",
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {isSelected && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-orange-500" />
              )}
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-800 leading-tight block">
                {cat.name}
              </span>
              <span className="text-[10px] text-orange-600 mt-1 block">
                {cat.creditCost} créditos/aplicación
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {selected.length} especialidad{selected.length !== 1 ? "es" : ""} seleccionada{selected.length !== 1 ? "s" : ""}
      </p>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || selected.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
      >
        {loading ? "Guardando..." : "Continuar"}
        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
    </div>
  )
}
