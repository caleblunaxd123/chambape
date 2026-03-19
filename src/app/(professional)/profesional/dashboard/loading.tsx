/* Skeleton del dashboard profesional */
export default function DashboardProfLoading() {
  return (
    <div className="animate-pulse">
      {/* Page Header */}
      <div className="cp-page-header">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 rounded-lg" />
            <div className="h-4 w-48 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl hidden sm:block" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Main column ── */}
          <div className="space-y-5">
            {/* Banner estado */}
            <div className="h-16 bg-gray-100 rounded-2xl border border-gray-100" />

            {/* Oportunidades */}
            <div className="space-y-3">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl border border-gray-100" />
              ))}
            </div>

            {/* Mis aplicaciones */}
            <div className="space-y-3">
              <div className="h-5 w-44 bg-gray-200 rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl border border-gray-100" />
              ))}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Créditos */}
            <div className="h-36 bg-gray-100 rounded-2xl border border-gray-100" />
            {/* Rendimiento */}
            <div className="h-44 bg-gray-100 rounded-2xl border border-gray-100" />
            {/* Accesos rápidos */}
            <div className="h-40 bg-gray-100 rounded-2xl border border-gray-100" />
          </div>

        </div>
      </div>
    </div>
  )
}
