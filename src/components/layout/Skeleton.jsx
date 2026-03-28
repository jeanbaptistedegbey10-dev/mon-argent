function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-48 mb-2" />
          <SkeletonBox className="h-4 w-32" />
        </div>
        <SkeletonBox className="h-9 w-24 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <SkeletonBox className="h-9 w-9 rounded-lg mb-3" />
            <SkeletonBox className="h-3 w-20 mb-2" />
            <SkeletonBox className="h-7 w-32 mb-2" />
            <SkeletonBox className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <SkeletonBox className="h-5 w-40 mb-4" />
          <SkeletonBox className="h-[220px] w-full" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <SkeletonBox className="h-5 w-32 mb-4" />
          <SkeletonBox className="h-[160px] w-[160px] rounded-full mx-auto" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBox className="h-2.5 w-2.5 flex-shrink-0 rounded-full" />
                <SkeletonBox className="h-3 flex-1" />
                <SkeletonBox className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-5 w-40" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <SkeletonBox className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBox className="h-4 w-36 mb-1.5" />
              <SkeletonBox className="h-3 w-24" />
            </div>
            <SkeletonBox className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TransactionsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-40 mb-2" />
          <SkeletonBox className="h-4 w-32" />
        </div>
        <SkeletonBox className="h-9 w-24 rounded-lg" />
      </div>

      {/* Recherche */}
      <SkeletonBox className="h-10 w-full rounded-lg mb-4" />

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <SkeletonBox className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBox className="h-4 w-40 mb-1.5" />
              <SkeletonBox className="h-3 w-28" />
            </div>
            <SkeletonBox className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BudgetsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-32 mb-2" />
          <SkeletonBox className="h-4 w-44" />
        </div>
        <SkeletonBox className="h-9 w-36 rounded-lg" />
      </div>

      {/* Résumé global */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <SkeletonBox className="h-4 w-40 mb-3" />
        <SkeletonBox className="h-7 w-56 mb-3" />
        <SkeletonBox className="h-2.5 w-full rounded-full" />
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <SkeletonBox className="h-10 w-10 rounded-xl" />
                <div>
                  <SkeletonBox className="h-4 w-24 mb-1.5" />
                  <SkeletonBox className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <SkeletonBox className="h-7 w-7 rounded-lg" />
                <SkeletonBox className="h-7 w-7 rounded-lg" />
              </div>
            </div>
            <SkeletonBox className="h-6 w-40 mb-2" />
            <SkeletonBox className="h-2 w-full rounded-full mb-3" />
            <SkeletonBox className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccountsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-36 mb-2" />
          <SkeletonBox className="h-4 w-24" />
        </div>
        <SkeletonBox className="h-9 w-36 rounded-lg" />
      </div>

      {/* Solde consolidé */}
      <div className="bg-blue-600 rounded-xl p-5 mb-6">
        <SkeletonBox className="h-4 w-32 mb-2 bg-blue-500" />
        <SkeletonBox className="h-9 w-48 mb-2 bg-blue-500" />
        <SkeletonBox className="h-3 w-36 bg-blue-500" />
      </div>

      {/* Grille comptes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <SkeletonBox className="h-12 w-12 rounded-xl" />
                <div>
                  <SkeletonBox className="h-4 w-28 mb-1.5" />
                  <SkeletonBox className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <SkeletonBox className="h-7 w-7 rounded-lg" />
                <SkeletonBox className="h-7 w-7 rounded-lg" />
              </div>
            </div>
            <SkeletonBox className="h-3 w-24 mb-1" />
            <SkeletonBox className="h-8 w-40 mb-4" />
            <SkeletonBox className="h-1 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CategoriesSkeleton() {
  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-36 mb-2" />
          <SkeletonBox className="h-4 w-28" />
        </div>
        <SkeletonBox className="h-9 w-40 rounded-lg" />
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <SkeletonBox className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBox className="h-4 w-28" />
            </div>
            <SkeletonBox className="h-3 w-3 rounded-full" />
            <div className="flex gap-1.5">
              <SkeletonBox className="h-7 w-7 rounded-lg" />
              <SkeletonBox className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReportsSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-32 mb-2" />
          <SkeletonBox className="h-4 w-48" />
        </div>
        <SkeletonBox className="h-9 w-32 rounded-lg" />
      </div>

      {/* Périodes */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <SkeletonBox className="h-3 w-24 mb-2" />
            <SkeletonBox className="h-7 w-32 mb-1" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Graphique barres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
        <SkeletonBox className="h-5 w-40 mb-4" />
        <SkeletonBox className="h-[240px] w-full" />
      </div>

      {/* Donut + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <SkeletonBox className="h-5 w-44 mb-4" />
          <SkeletonBox className="h-[180px] w-[180px] rounded-full mx-auto mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBox className="h-2.5 w-2.5 rounded-sm flex-shrink-0" />
                <SkeletonBox className="h-3 flex-1" />
                <SkeletonBox className="h-3 w-16" />
                <SkeletonBox className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <SkeletonBox className="h-5 w-44 mb-4" />
          <SkeletonBox className="h-[200px] w-full" />
        </div>
      </div>

      {/* Top dépenses */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <SkeletonBox className="h-5 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
            <SkeletonBox className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBox className="h-4 w-36 mb-1.5" />
              <SkeletonBox className="h-3 w-24" />
            </div>
            <SkeletonBox className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-36 mb-2" />
          <SkeletonBox className="h-4 w-52" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-9 w-9 rounded-lg" />
          <SkeletonBox className="h-5 w-36" />
          <SkeletonBox className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Stats mois */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <SkeletonBox className="h-3 w-20 mb-2" />
            <SkeletonBox className="h-6 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Calendrier */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-7 mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonBox key={i} className="h-4 mx-1 mb-2" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <SkeletonBox key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Détail */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <SkeletonBox className="h-4 w-24 mb-1" />
          <SkeletonBox className="h-5 w-40 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800" />
          <div className="grid grid-cols-2 gap-2 mb-4">
            <SkeletonBox className="h-14 rounded-lg" />
            <SkeletonBox className="h-14 rounded-lg" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
              <SkeletonBox className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <SkeletonBox className="h-3 w-24 mb-1.5" />
                <SkeletonBox className="h-3 w-16" />
              </div>
              <SkeletonBox className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton({ lines = 5 }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SkeletonBox className="h-8 w-40 mb-2" />
          <SkeletonBox className="h-4 w-28" />
        </div>
        <SkeletonBox className="h-9 w-28 rounded-lg" />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="space-y-4">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <SkeletonBox className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <SkeletonBox className="h-4 w-32 mb-1.5" />
                <SkeletonBox className="h-3 w-48" />
              </div>
              <SkeletonBox className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}