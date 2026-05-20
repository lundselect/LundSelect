export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-3 w-64 bg-offwhite/5 rounded animate-pulse mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <div className="aspect-[3/4] bg-offwhite/5 animate-pulse" />
        <div className="flex flex-col justify-center space-y-4">
          <div className="h-3 w-24 bg-gold/10 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-offwhite/5 rounded animate-pulse" />
          <div className="h-4 w-full bg-offwhite/5 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-offwhite/5 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gold/10 rounded animate-pulse mt-4" />
          <div className="h-12 w-full bg-gold/20 rounded animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}
