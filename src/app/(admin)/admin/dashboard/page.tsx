import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { Users, ClipboardList, Coins, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"

export const metadata = { title: "Panel Maestro — ChambaPe" }

export default async function AdminDashboardPage() {
  await requireAdmin()

  // Métricas generales en paralelo
  const [
    totalProfesionales,
    pendienteVerificacion,
    totalClientes,
    totalSolicitudes,
    solicitudesAbiertas,
    solicitudesCompletadas,
    totalReseñas,
    ingresosTotal,
    profesionalesHoy,
    solicitudesHoy,
    clientesHoy,
  ] = await Promise.all([
    db.professionalProfile.count(),
    db.professionalProfile.count({ where: { status: "PENDING_VERIFICATION" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.serviceRequest.count(),
    db.serviceRequest.count({ where: { status: "OPEN" } }),
    db.serviceRequest.count({ where: { status: "COMPLETED" } }),
    db.review.count({ where: { hidden: false } }),
    db.creditTransaction.aggregate({
      where: { type: "PURCHASE", amountPen: { not: null } },
      _sum: { amountPen: true },
    }),
    db.professionalProfile.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.serviceRequest.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.user.count({
      where: {
        role: "CLIENT",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  const ingresosSoles = ingresosTotal._sum.amountPen ?? 0

  // Últimas solicitudes
  const ultimasSolicitudes = await db.serviceRequest.findMany({
    include: { category: true, client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Nuevos usuarios registrados (Clientes y Profesionales combinados)
  const ultimosUsuarios = await db.user.findMany({
    where: { role: { in: ["CLIENT", "PROFESSIONAL"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      professionalProfile: {
        select: { status: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  return (
    <div className="relative min-h-screen bg-white noise-bg overflow-hidden p-4 sm:p-8">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-400/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-400/15 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto space-y-10 z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>Panel Maestro</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg capitalize">
              {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-4 glass-panel bg-white/60 border-white py-3 px-6 rounded-3xl shadow-2xl shadow-slate-200/50 animate-fade-in active:scale-95 transition-transform cursor-pointer">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Sistemas Activos</span>
          </div>
        </div>

        {/* Alerta de verificaciones pendientes - Premium */}
        {pendienteVerificacion > 0 && (
          <div className="glass-panel relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 bg-gradient-to-br from-orange-500/15 to-amber-500/5 border-orange-500/30 rounded-[3rem] p-10 animate-fade-up shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
            <div className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center shrink-0 shadow-2xl shadow-orange-500/40 relative z-10 transition-transform group-hover:scale-110">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center lg:text-left relative z-10">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {pendienteVerificacion} profesional{pendienteVerificacion > 1 ? "es" : ""} esperando validación
              </h3>
              <p className="text-lg text-slate-600 mt-2 font-medium">Hay nuevos talentos que necesitan tu revisión para empezar a operar.</p>
            </div>
            <Link
              href="/admin/profesionales?filter=PENDING_VERIFICATION"
              className="relative z-10 bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black text-base hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20 shrink-0"
            >
              Revisar Ahora
            </Link>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-7 h-7 text-white" />}
            label="Profesionales"
            value={totalProfesionales}
            sub={`${pendienteVerificacion} pendientes`}
            subIcon={<AlertCircle className="w-4 h-4" />}
            colorClass="from-blue-600 to-indigo-700"
          />
          <StatCard
            icon={<Users className="w-7 h-7 text-white" />}
            label="Clientes"
            value={totalClientes}
            sub={`+${clientesHoy} hoy`}
            colorClass="from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={<ClipboardList className="w-7 h-7 text-white" />}
            label="Solicitudes"
            value={totalSolicitudes}
            sub={`${solicitudesAbiertas} abiertas`}
            colorClass="from-orange-500 to-amber-600"
          />
          <StatCard
            icon={<Coins className="w-7 h-7 text-white" />}
            label="Ingresos"
            value={`S/ ${ingresosSoles.toLocaleString("es-PE")}`}
            sub={`${totalReseñas} reseñas`}
            colorClass="from-purple-600 to-fuchsia-700"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel bg-white/60 border-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-black mb-4 uppercase tracking-[0.2em]">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Efectividad
            </div>
            <p className="text-4xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {totalSolicitudes > 0 ? Math.round((solicitudesCompletadas / totalSolicitudes) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-400 mt-2 font-bold">{solicitudesCompletadas} completadas</p>
          </div>
          <div className="glass-panel bg-white/60 border-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-black mb-4 uppercase tracking-[0.2em]">
              <Clock className="w-5 h-5 text-blue-500" />
              Nuevos Hoy
            </div>
            <p className="text-4xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{profesionalesHoy + solicitudesHoy}</p>
            <p className="text-sm text-slate-400 mt-2 font-bold">{profesionalesHoy} pros · {solicitudesHoy} reqs</p>
          </div>
          <div className="glass-panel bg-white/60 border-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-black mb-4 uppercase tracking-[0.2em]">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              En Proceso
            </div>
            <p className="text-4xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{solicitudesAbiertas}</p>
            <p className="text-sm text-slate-400 mt-2 font-bold">Solicitudes abiertas</p>
          </div>
        </div>
{/* Analytics Section */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
            <h2 className="text-3xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Analíticas de Plataforma</h2>
          </div>
          <AnalyticsDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users Feed */}
          <div className="glass-panel bg-white/70 border-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/30">
            <div className="flex items-center justify-between px-8 py-7 border-b border-white/40 bg-white/30">
              <h2 className="font-black text-slate-900 text-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>Nuevos Registros</h2>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">Live</span>
            </div>
            <div className="divide-y divide-white/40">
              {ultimosUsuarios.map((u) => {
                const isPro = u.role === "PROFESSIONAL";
                const badgeColor = isPro ? "text-indigo-600 bg-indigo-50 border-indigo-100 font-black" : "text-emerald-600 bg-emerald-50 border-emerald-100 font-black";
                return (
                  <div key={u.id} className="flex items-center gap-5 px-8 py-6 hover:bg-white/50 transition-all group cursor-default">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform ${isPro ? "bg-gradient-to-br from-indigo-500 to-violet-700" : "bg-gradient-to-br from-emerald-400 to-teal-600"}`}>
                      {u.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-base font-black text-slate-900 truncate tracking-tight">{u.name}</p>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${badgeColor}`}>
                          {isPro ? "Pro" : "Cliente"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate font-medium">{u.email}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-400 hidden sm:block">
                      {u.createdAt.toLocaleDateString("es-PE", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Workflow Feed */}
          <div className="glass-panel bg-white/70 border-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/30">
            <div className="flex items-center justify-between px-8 py-7 border-b border-white/40 bg-white/30">
              <h2 className="font-black text-slate-900 text-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>Actividad Reciente</h2>
              <Link href="/admin/solicitudes" className="text-xs text-indigo-600 font-black hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100 transition-all hover:bg-indigo-200">Ver Historial</Link>
            </div>
            <div className="divide-y divide-white/40">
              {ultimasSolicitudes.map((s) => (
                <Link href={`/admin/solicitudes/${s.id}`} key={s.id} className="flex items-center justify-between px-8 py-6 hover:bg-white/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-lg border border-slate-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                      {s.category.icon}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 line-clamp-1 tracking-tight">{s.title}</p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{s.client.name} · {s.district}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subIcon,
  colorClass,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  subIcon?: React.ReactNode
  colorClass: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/80 group transition-all hover:-translate-y-1`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-95`} />
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className={`w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
          {icon}
        </div>
        <p className="text-4xl lg:text-5xl font-black text-white mb-2 leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
        <p className="text-sm text-white/90 font-black uppercase tracking-widest mb-4">{label}</p>
        
        {sub && (
          <div className="flex items-center gap-2 text-white/95 text-xs font-black bg-black/15 w-fit px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/5">
            {subIcon}
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  EXPIRED: "bg-amber-100 text-amber-800 border-amber-200",
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En curso",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] uppercase tracking-[0.1em] font-black px-3 py-1.5 rounded-full border shadow-sm ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
