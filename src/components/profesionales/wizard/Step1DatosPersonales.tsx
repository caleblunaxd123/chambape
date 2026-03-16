"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, Info } from "lucide-react"

const schema = z.object({
  fullName: z
    .string()
    .min(3, "Ingresa tu nombre completo")
    .max(100, "Nombre demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "Solo se permiten letras"),
  dni: z
    .string()
    .length(8, "El DNI debe tener exactamente 8 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),
  phone: z
    .string()
    .min(9, "Ingresa un número válido")
    .regex(/^[+\d\s]+$/, "Número inválido"),
})

type FormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<FormData>
  onNext: (data: FormData) => Promise<void>
  loading: boolean
}

export function Step1DatosPersonales({ defaultValues, onNext, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { fullName: "", dni: "", phone: "" },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      {/* Nombre completo */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName">
          Nombre completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder="Ej: Juan Carlos García López"
          autoCapitalize="words"
          className={errors.fullName ? "border-red-400" : ""}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
        <p className="text-xs text-gray-400">
          Escribe tu nombre tal como aparece en tu DNI
        </p>
      </div>

      {/* DNI */}
      <div className="space-y-1.5">
        <Label htmlFor="dni">
          Número de DNI <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dni"
          {...register("dni")}
          placeholder="12345678"
          maxLength={8}
          inputMode="numeric"
          className={errors.dni ? "border-red-400" : ""}
        />
        {errors.dni && (
          <p className="text-xs text-red-500">{errors.dni.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Número de celular <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="987 654 321"
          inputMode="tel"
          className={errors.phone ? "border-red-400" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone.message}</p>
        )}
        <p className="text-xs text-gray-400">
          Los clientes podrán contactarte a este número
        </p>
      </div>

      {/* Info */}
      <div className="flex gap-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Tu DNI se usará solo para verificar tu identidad. No se mostrará
          públicamente en tu perfil.
        </span>
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
