export default function ProfesionalesLoading() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
      {/* Hero */}
      <div className="space-y-3 py-6">
        <div className="h-9 w-72 bg-gray-200 rounded-lg mx-auto" />
        <div className="h-5 w-96 bg-gray-100 rounded mx-auto" />
      </div>
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
      {/* Grid de profesionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="h-9 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
