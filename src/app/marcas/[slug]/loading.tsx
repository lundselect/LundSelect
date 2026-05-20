export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-3 w-48 bg-offwhite/5 rounded animate-pulse mb-12" />
      <div className="border border-gold/10 p-8 sm:p-12 mb-16">
        <div className="h-3 w-24 bg-gold/10 rounded animate-pulse mb-4" />
        <div className="h-10 w-64 bg-offwhite/5 rounded animate-pulse mb-4" />
        <div className="h-4 w-full max-w-lg bg-offwhite/5 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-offwhite/5 animate-pulse mb-3" />
            <div className="h-3 w-20 bg-offwhite/5 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-offwhite/5 rounded animate-pulse mb-2" />
            <div className="h-4 w-16 bg-gold/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
