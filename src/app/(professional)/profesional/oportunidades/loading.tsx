export default function OportunidadesLoading() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="h-8 w-52 bg-gray-200 rounded-lg" />
      <div className="h-4 w-64 bg-gray-100 rounded" />
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      {/* Cards */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
            <div className="h-8 w-14 bg-amber-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
