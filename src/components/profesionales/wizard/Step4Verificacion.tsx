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
  dniEsperado?: string
  defaultValues?: Partial<DocumentState>
  onNext: (data: DocumentState) => Promise<void>
  loading: boolean
}

export function Step4Verificacion({ dniEsperado, defaultValues, onNext, loading }: Props) {
  const [docs, setDocs] = useState<Partial<DocumentState>>(defaultValues ?? {})
  const [errores, setErrores] = useState<Record<string, string | null>>({})

  function validateOCR(result: any, type: keyof DocumentState) {
    if (!dniEsperado) return

    const annotations = result?.info?.ocr?.adv_ocr?.data?.[0]?.textAnnotations
    const fullText = (annotations?.[0]?.description ?? "").toUpperCase()

    if (!fullText) {
      console.warn(`No se detectó texto en ${type}`)
      return
    }

    const newErrores = { ...errores }

    // Validar solo el número de DNI (el admin verifica el nombre visualmente)
    const hasDni = fullText.includes(dniEsperado)

    if (!hasDni && type !== "dniBackUrl") {
      newErrores[type] = `El número de DNI en la foto no coincide con ${dniEsperado}. Verifica que sea legible.`
    } else {
      newErrores[type] = null
    }

    setErrores(newErrores)
    
    if (!newErrores[type]) {
      toast.success(`${type === "dniFrontUrl" ? "Frente" : type === "dniBackUrl" ? "Reverso" : "Selfie"} validado con éxito`)
    } else {
      toast.error(newErrores[type])
    }
  }

  function handleSubmit() {
    if (!docs.dniFrontUrl || !docs.dniBackUrl || !docs.selfieDniUrl) {
      toast.error("Debes subir los 3 documentos requeridos")
      return
    }
    
    const hasErrors = Object.values(errores).some(e => e !== null)
    if (hasErrors) {
      toast.error("Por favor, corrige los errores en las fotos antes de continuar.")
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
        hint="Asegúrate de que el número de DNI y tus nombres se vean claramente"
        aspectRatio="landscape"
        value={docs.dniFrontUrl}
        onResult={(res) => validateOCR(res, "dniFrontUrl")}
        onChange={(url) => setDocs((prev) => ({ ...prev, dniFrontUrl: url }))}
        onRemove={() => {
          setDocs((prev) => ({ ...prev, dniFrontUrl: undefined }))
          setErrores(prev => ({ ...prev, dniFrontUrl: null }))
        }}
      />
      {errores.dniFrontUrl && (
        <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg flex gap-1.5 items-center">
          <AlertCircle className="w-3 h-3" /> {errores.dniFrontUrl}
        </p>
      )}

      {/* DNI Reverso */}
      <ImageUpload
        folder="dniReverso"
        label="Foto del DNI — parte trasera"
        hint="Incluye la parte con el código de barras"
        aspectRatio="landscape"
        value={docs.dniBackUrl}
        onResult={(res) => validateOCR(res, "dniBackUrl")}
        onChange={(url) => setDocs((prev) => ({ ...prev, dniBackUrl: url }))}
        onRemove={() => {
          setDocs((prev) => ({ ...prev, dniBackUrl: undefined }))
          setErrores(prev => ({ ...prev, dniBackUrl: null }))
        }}
      />
      {errores.dniBackUrl && (
        <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg flex gap-1.5 items-center">
          <AlertCircle className="w-3 h-3" /> {errores.dniBackUrl}
        </p>
      )}

      {/* Selfie con DNI */}
      <ImageUpload
        folder="selfieDni"
        label="Selfie sosteniendo tu DNI"
        hint="Tómate una foto sosteniendo tu DNI cerca de tu rostro. Identificaremos el carnet para mayor seguridad."
        aspectRatio="portrait"
        value={docs.selfieDniUrl}
        onResult={(res) => validateOCR(res, "selfieDniUrl")}
        onChange={(url) => setDocs((prev) => ({ ...prev, selfieDniUrl: url }))}
        onRemove={() => {
          setDocs((prev) => ({ ...prev, selfieDniUrl: undefined }))
          setErrores(prev => ({ ...prev, selfieDniUrl: null }))
        }}
      />
      {errores.selfieDniUrl && (
        <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg flex gap-1.5 items-center">
          <AlertCircle className="w-3 h-3" /> {errores.selfieDniUrl}
        </p>
      )}

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
        disabled={loading || !allUploaded || Object.values(errores).some(e => e !== null)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
      >
        {loading ? "Guardando..." : "Continuar"}
        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
    </div>
  )
}
