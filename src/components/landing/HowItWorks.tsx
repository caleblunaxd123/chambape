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
          <div key={i} className={`relative flex flex-col glass-panel hover:bg-white rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-2 group overflow-hidden border border-slate-100 hover:border-orange-200`}>
            {/* Hover overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`} />

            {/* Connector line on desktop */}
            {i < STEPS_CLIENT.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-full w-full h-px border-t-2 border-dashed border-slate-200 z-0 opacity-50 group-hover:border-orange-300 transition-colors" style={{ width: "calc(100% - 2rem)", left: "calc(100% - 1rem)" }} />
            )}

            {/* Number badge & Icon */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="stat-number text-5xl text-slate-100 group-hover:text-orange-100 transition-colors duration-300 leading-none">{step.number}</span>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-3 leading-snug relative z-10">{step.title}</h3>
            <p className="text-[15px] text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
          </div>
        )
      })}
    </div>
  )
}
