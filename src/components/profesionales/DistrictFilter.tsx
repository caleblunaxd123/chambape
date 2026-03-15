"use client"

import { useRouter } from "next/navigation"
import { DISTRITOS } from "@/constants/distritos"

interface Props {
  currentDistrito?: string
  currentCategoria?: string
  currentQ?: string
}

export function DistrictFilter({ currentDistrito, currentCategoria, currentQ }: Props) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams()
    if (currentCategoria) params.set("categoria", currentCategoria)
    if (currentQ) params.set("q", currentQ)
    if (e.target.value) params.set("distrito", e.target.value)
    router.push(`/profesionales?${params.toString()}`)
  }

  return (
    <select
      defaultValue={currentDistrito ?? ""}
      onChange={handleChange}
      className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-orange-300 cursor-pointer"
    >
      <option value="">Todos los distritos</option>
      {DISTRITOS.map((d) => (
        <option key={d.slug} value={d.slug}>{d.name}</option>
      ))}
    </select>
  )
}
