import { SolicitudForm } from "@/components/solicitudes/SolicitudForm"

export const metadata = { title: "Nueva solicitud" }

export default async function NuevaSolicitudPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <SolicitudForm defaultCategoria={categoria} />
    </div>
  )
}
