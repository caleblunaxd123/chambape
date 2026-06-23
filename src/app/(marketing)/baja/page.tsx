import { CheckCircle2 } from "lucide-react"
import { db } from "@/lib/db"

export const metadata = {
  title: "Darse de baja — ChambaPe",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ lead?: string }>
}

export default async function BajaPage({ searchParams }: Props) {
  const { lead: leadId } = await searchParams

  if (leadId) {
    await db.acquisitionLead.updateMany({
      where: { id: leadId, optedOutAt: null },
      data: { optedOutAt: new Date(), estado: "OPT_OUT" },
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h1
          className="text-2xl font-black text-slate-900 mb-2 tracking-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Listo, no te volveremos a escribir
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Te hemos quitado de nuestra lista de invitaciones. Si cambias de
          opinión, siempre puedes registrarte gratis en chambape.pe.
        </p>
      </div>
    </div>
  )
}
