'use client'

export function MetricCardSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 animate-pulse">
      {/* Заголовок */}
      <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
      
      {/* Основное значение */}
      <div className="h-8 bg-white/20 rounded w-2/3 mb-2" />
      
      {/* Подзаголовок/прогресс */}
      <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  )
}

export function MetricCardSkeletonWide() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-4 bg-white/10 rounded w-12" />
      </div>
      
      <div className="space-y-2">
        <div className="h-6 bg-white/20 rounded w-3/4" />
        <div className="h-6 bg-white/20 rounded w-2/3" />
      </div>
      
      <div className="mt-4 h-2 bg-white/5 rounded-full w-full" />
    </div>
  )
}

