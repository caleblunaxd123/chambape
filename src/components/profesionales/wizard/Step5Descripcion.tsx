"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/shared/ImageUpload"

const schema = z.object({
  bio: z
    .string()
    .min(30, "Cuéntanos más sobre ti (mínimo 30 caracteres)")
    .max(500, "Máximo 500 caracteres"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<FormData>
  onNext: (data: FormData) => Promise<void>
  loading: boolean
}

// Ejemplos de bio para dar ideas al profesional
const EJEMPLOS = [
  "Electricista con 10 años en Lima. Instalaciones residenciales, tableros y mantenimiento. Trabajo garantizado.",
  "Gasfitero especialista en filtraciones y termas. Atención rápida en Miraflores y alrededores.",
  "Pintora de interiores y exteriores. Trabajo limpio y puntual. Referencias disponibles.",
]

export function Step5Descripcion({ defaultValues, onNext, loading }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { bio: "", avatarUrl: "" },
  })

  const bio = watch("bio")
  const avatarUrl = watch("avatarUrl")

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      {/* Foto de perfil */}
      <div className="space-y-1.5">
        <Label>Foto de perfil (opcional)</Label>
        <div className="flex items-start gap-4">
          <div className="w-24 shrink-0">
            <ImageUpload
              folder="avatares"
              aspectRatio="square"
              value={avatarUrl || undefined}
              onChange={(url) => setValue("avatarUrl", url)}
              onRemove={() => setValue("avatarUrl", "")}
              hint=""
            />
          </div>
          <div className="text-xs text-gray-500 pt-1 leading-relaxed">
            Una foto profesional genera más confianza. Los perfiles con foto reciben
            <strong className="text-orange-600"> 3x más contactos</strong>.
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">
          Descripción profesional <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="Cuéntale a los clientes quién eres, cuánta experiencia tienes y qué te diferencia..."
          rows={4}
          maxLength={500}
          className={errors.bio ? "border-red-400" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.bio ? (
            <p className="text-xs text-red-500">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{bio?.length ?? 0}/500</span>
        </div>
      </div>

      {/* Ejemplos de bio */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Ejemplos de buena descripción:</p>
        <div className="space-y-1.5">
          {EJEMPLOS.map((ejemplo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValue("bio", ejemplo)}
              className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 rounded-lg p-2.5 transition-colors border border-gray-100"
            >
              "{ejemplo}"
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
      >
        {loading ? "Guardando..." : "Continuar"}
        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
    </form>
  )
}
