import { FileText, Users, CheckCircle2, Star } from "lucide-react"

const STEPS_CLIENT = [
  {
    number: "01",
    icon: FileText,
    title: "Describe tu problema",
    desc: "Cuéntanos qué necesitas: gasfitería, electricidad, pintura… Agrega fotos si puedes. Solo toma 2 minutos.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    number: "02",
    icon: Users,
    title: "Recibe propuestas",
    desc: "Profesionales verificados de tu distrito te envían cotizaciones con precios y disponibilidad. Tú eliges.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Coordina y listo",
    desc: "Elige al profesional que más te convenga, coordina por teléfono y paga directo a él. Sin comisiones.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    number: "04",
    icon: Star,
    title: "Deja tu reseña",
    desc: "Después del servicio, comparte tu experiencia. Ayudas a otros limeños a elegir mejor.",
    color: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
]

export function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STEPS_CLIENT.map((step, i) => {
        const Icon = step.icon
        return (
          <div key={i} className={`relative flex flex-col bg-white rounded-2xl border ${step.border} p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1`}>
            {/* Connector line on desktop */}
            {i < STEPS_CLIENT.length - 1 && (
              <div className="hidden lg:block absolute top-[2.75rem] left-full w-full h-px border-t-2 border-dashed border-gray-200 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(100% - 1.5rem)" }} />
            )}

            {/* Number badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="stat-number text-4xl text-gray-100 leading-none">{step.number}</span>
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        )
      })}
    </div>
  )
}
