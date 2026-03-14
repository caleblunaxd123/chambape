import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PlusCircle, ArrowRight, Clock, CheckCircle2, Users, Sparkles } from "lucide-react"
import { URGENCIA_LABELS, REQUEST_STATUS_LABELS, formatFechaRelativa } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"

export const metadata = { title: "Mi panel" }

const CATEGORIAS_RAPIDAS = [
  "gasfiteria", "electricidad", "pintura", "limpieza-hogar",
  "carpinteria", "cerrajeria", "fumigacion", "mudanzas",
]

const STATUS_STYLE: Record<string, string> = {
  OPEN: "badge-open",
  IN_PROGRESS: "badge-progress",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
  EXPIRED: "badge-cancelled",
}

export default async function DashboardClientePage() {
  const user = await requireAuth()
  if (user.role === "PROFESSIONAL") redirect("/profesional/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  const solicitudes = await db.serviceRequest.findMany({
    where: { clientId: user.id },
    include: {
      category: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const totalActivas = solicitudes.filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS").length
  const totalCompletadas = solicitudes.filter((s) => s.status === "COMPLETED").length
  const firstTime = solicitudes.length === 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Page Header ────────────────────────────── */}
      <div className="cp-page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Hola, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">¿Qué necesitas arreglar hoy?</p>
          </div>
          <Link
            href="/solicitudes/nueva"
            className="btn-primary text-sm hidden sm:inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva solicitud
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* ── Primer uso — banner de bienvenida ─── */}
        {firstTime && (
          <div className="relative overflow-hidden rounded-2xl p-6 text-white" style={{ background: "var(--brand-gradient)" }}>
            <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white opacity-5" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">🎉</div>
              <div>
                <p className="font-black text-lg mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>¡Bienvenido a ChambaPe!</p>
                <p className="text-orange-100 text-sm leading-relaxed mb-4">
                  Para empezar, publica tu primera solicitud. Recibirás presupuestos de profesionales verificados en tu zona en cuestión de minutos.
                </p>
                <Link
                  href="/solicitudes/nueva"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publicar mi primera solicitud
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA principal (cuando ya tiene solicitudes) ─── */}
        {!firstTime && (
          <Link
            href="/solicitudes/nueva"
            className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl p-5 transition-all shadow-md shadow-orange-200/50 hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <div>
              <p className="font-black text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>Publicar nueva solicitud</p>
              <p className="text-orange-100 text-sm mt-0.5">
                Recibe hasta 5 presupuestos de profesionales verificados
              </p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
          </Link>
        )}

        {/* ── Stats ─────────────────────────────────── */}
        {!firstTime && (
          <div className="grid grid-cols-3 gap-3">
            <div className="cp-stat-card">
              <p className="stat-number text-2xl text-gray-900">{solicitudes.length}</p>
              <p className="text-xs text-gray-400 mt-1">Solicitudes</p>
            </div>
            <div className="cp-stat-card">
              <p className="stat-number text-2xl text-orange-500">{totalActivas}</p>
              <p className="text-xs text-gray-400 mt-1">Activas</p>
            </div>
            <div className="cp-stat-card">
              <p className="stat-number text-2xl text-emerald-500">{totalCompletadas}</p>
              <p className="text-xs text-gray-400 mt-1">Completadas</p>
            </div>
          </div>
        )}

        {/* ── Servicios rápidos ──────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Servicios populares
            </h2>
            <span className="text-xs text-gray-400">Tap para solicitar</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {CATEGORIAS_RAPIDAS.map((slug) => {
              const cat = CATEGORIAS_MAP[slug]
              if (!cat) return null
              return (
                <Link
                  key={slug}
                  href={`/solicitudes/nueva?categoria=${slug}`}
                  className="group flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 p-3 hover:border-orange-200 hover:shadow-sm hover:bg-orange-50 transition-all text-center"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-[11px] text-gray-600 leading-tight font-medium line-clamp-1">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Solicitudes recientes ──────────────────── */}
        {solicitudes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base">Mis solicitudes</h2>
              <Link
                href="/solicitudes"
                className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {solicitudes.map((s) => (
                <Link
                  key={s.id}
                  href={`/solicitudes/${s.id}`}
                  className="cp-card-link flex items-center gap-3 p-3.5"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {s.category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_STYLE[s.status]}`}>
                        {REQUEST_STATUS_LABELS[s.status]}
                      </span>
                      {s._count.applications > 0 && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {s._count.applications} propuesta{s._count.applications !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-gray-400">{formatFechaRelativa(s.createdAt)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
