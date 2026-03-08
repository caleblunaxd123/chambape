"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, CheckCircle2, Coins } from "lucide-react"
import { AplicarModal } from "./AplicarModal"
import { cn } from "@/lib/utils"

interface Props {
  solicitudId: string
  solicitudTitle: string
  categoriaSlug: string
  creditCost: number
  currentCredits: number
  yaAplie: boolean
}

export function AplicarButton({
  solicitudId,
  solicitudTitle,
  categoriaSlug,
  creditCost,
  currentCredits,
  yaAplie: initialApplied,
}: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [applied, setApplied] = useState(initialApplied)
  const canApply = currentCredits >= creditCost

  function handleSuccess(newBalance: number) {
    setApplied(true)
    setShowModal(false)
    router.refresh()
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Ya enviaste tu propuesta para esta solicitud
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
        <div className={cn("flex items-center gap-1.5 text-sm font-semibold", canApply ? "text-orange-600" : "text-red-500")}>
          <Coins className="w-4 h-4" />
          {creditCost} créditos para aplicar
          <span className="text-xs font-normal text-gray-400 ml-1">(tienes {currentCredits})</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!canApply}
          className={cn(
            "flex items-center gap-1.5 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors",
            canApply
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {canApply ? (
            <>Aplicar <ChevronRight className="w-4 h-4" /></>
          ) : (
            "Sin créditos suficientes"
          )}
        </button>
      </div>

      {showModal && (
        <AplicarModal
          solicitudId={solicitudId}
          solicitudTitle={solicitudTitle}
          categoriaSlug={categoriaSlug}
          creditCost={creditCost}
          currentCredits={currentCredits}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
