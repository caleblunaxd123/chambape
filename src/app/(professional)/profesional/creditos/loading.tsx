export default function CreditosLoading() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
      {/* Balance card */}
      <div className="h-32 bg-gray-200 rounded-2xl" />
      {/* Tabs */}
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        <div className="h-10 w-32 bg-gray-100 rounded-xl" />
      </div>
      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl border border-gray-100" />
        ))}
      </div>
    </div>
  )
}
