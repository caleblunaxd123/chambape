import { SolicitudForm } from "@/components/solicitudes/SolicitudForm"

export const metadata = { title: "Nueva solicitud" }

export default function NuevaSolicitudPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <SolicitudForm defaultCategoria={searchParams.categoria} />
    </div>
  )
}
