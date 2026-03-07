"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { Button } from "@/components/ui/button"

interface DocumentState {
  dniFrontUrl: string
  dniBackUrl: string
  selfieDniUrl: string
}

interface Props {
  defaultValues?: Partial<DocumentState>
  onNext: (data: DocumentState) => Promise<void>
  loading: boolean
}

export function Step4Verificacion({ defaultValues, onNext, loading }: Props) {
  const [docs, setDocs] = useState<Partial<DocumentState>>(defaultValues ?? {})

  function handleSubmit() {
    if (!docs.dniFrontUrl || !docs.dniBackUrl || !docs.selfieDniUrl) {
      toast.error("Debes subir los 3 documentos requeridos")
      return
    }
    onNext(docs as DocumentState)
  }

  const allUploaded = !!(docs.dniFrontUrl && docs.dniBackUrl && docs.selfieDniUrl)

  return (
    <div className="space-y-5">
      {/* Aviso de seguridad */}
      <div className="flex gap-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
        <ShieldCheck className="w-5 h-5 shrink-0 text-blue-500" />
        <div>
          <strong className="block mb-0.5">Tus documentos están seguros</strong>
          Solo el equipo de ChambaPe verá estas fotos para verificar tu identidad.
          Nunca las compartiremos con terceros.
        </div>
      </div>

      {/* DNI Frente */}
      <ImageUpload
        folder="dniFrente"
        label="Foto del DNI — parte frontal"
        hint="Asegúrate de que el número de DNI se vea claramente"
        aspectRatio="landscape"
        value={docs.dniFrontUrl}
        onChange={(url) => setDocs((prev) => ({ ...prev, dniFrontUrl: url }))}
        onRemove={() => setDocs((prev) => ({ ...prev, dniFrontUrl: undefined }))}
      />

      {/* DNI Reverso */}
      <ImageUpload
        folder="dniReverso"
        label="Foto del DNI — parte trasera"
        hint="Incluye la parte con el código de barras"
        aspectRatio="landscape"
        value={docs.dniBackUrl}
        onChange={(url) => setDocs((prev) => ({ ...prev, dniBackUrl: url }))}
        onRemove={() => setDocs((prev) => ({ ...prev, dniBackUrl: undefined }))}
      />

      {/* Selfie con DNI */}
      <ImageUpload
        folder="selfieDni"
        label="Selfie sosteniendo tu DNI"
        hint="Tómate una foto sosteniendo tu DNI cerca de tu rostro. Asegúrate de que tu cara y el DNI se vean claros."
        aspectRatio="portrait"
        value={docs.selfieDniUrl}
        onChange={(url) => setDocs((prev) => ({ ...prev, selfieDniUrl: url }))}
        onRemove={() => setDocs((prev) => ({ ...prev, selfieDniUrl: undefined }))}
      />

      {/* Aviso de revisión */}
      <div className="flex gap-2 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          El equipo de ChambaPe revisará tus documentos en un plazo de <strong>24 horas hábiles</strong>.
          Te notificaremos por email cuando tu cuenta sea verificada.
        </span>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !allUploaded}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
      >
        {loading ? "Guardando..." : "Continuar"}
        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
    </div>
  )
}
