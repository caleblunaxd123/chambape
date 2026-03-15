"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

interface Props {
  defaultValue?: string
  currentCategoria?: string
  currentDistrito?: string
}

export function SearchBar({ defaultValue = "", currentCategoria, currentDistrito }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when defaultValue changes externally (e.g. category reset)
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  function navigate(q: string) {
    const params = new URLSearchParams()
    if (currentCategoria) params.set("categoria", currentCategoria)
    if (currentDistrito) params.set("distrito", currentDistrito)
    if (q.trim()) params.set("q", q.trim())
    router.push(`/profesionales?${params.toString()}`)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setValue(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => navigate(q), 400)
  }

  function handleClear() {
    setValue("")
    if (timerRef.current) clearTimeout(timerRef.current)
    navigate("")
  }

  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
      <input
        value={value}
        onChange={handleChange}
        placeholder="Buscar por nombre..."
        className="w-full pl-10 pr-9 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
