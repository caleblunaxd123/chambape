"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowRight, Search, CheckCircle2 } from "lucide-react"
import { DISTRITOS, type Distrito } from "@/constants/distritos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Props {
  defaultSelected?: string[]
  onNext: (data: { districts: string[] }) => Promise<void>
  loading: boolean
}

export function Step3Cobertura({ defaultSelected = [], onNext, loading }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const [busqueda, setBusqueda] = useState("")

  const filtrados = DISTRITOS.filter((d) =>
    d.name.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Agrupar por provincia
  const porProvincia = filtrados.reduce<Record<string, Distrito[]>>(
    (acc, d) => {
      acc[d.provincia] = [...(acc[d.provincia] ?? []), d]
      return acc
    },
    {}
  )

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    )
  }

  function handleSubmit() {
    if (selected.length === 0) {
      toast.error("Selecciona al menos un distrito de cobertura")
      return
    }
    onNext({ districts: selected })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        ¿En qué distritos de Lima puedes prestar tus servicios?
      </p>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar distrito..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista de distritos agrupados */}
      <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
        {Object.entries(porProvincia).map(([provincia, distritos]) => (
          <div key={provincia}>
            <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {provincia}
            </div>
            {distritos.map((d) => {
              const isSelected = selected.includes(d.slug)
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => toggle(d.slug)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left",
                    isSelected
                      ? "bg-orange-50 text-orange-700"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  {d.name}
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        ))}

        {filtrados.length === 0 && (
          <p className="p-4 text-sm text-gray-400 text-center">
            No se encontraron distritos con ese nombre
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {selected.length} distrito{selected.length !== 1 ? "s" : ""} seleccionado{selected.length !== 1 ? "s" : ""}
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
