import { Skeleton } from "@/components/ui/skeleton"

export function ComplaintDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-9 w-24 mb-6" />

      <div className="space-y-6">
        {/* Название */}
        <Skeleton className="h-10 w-3/4" />

        {/* Подзаголовок */}
        <Skeleton className="h-5 w-1/2" />

        {/* Tabs */}
        <Skeleton className="h-10 w-64" />

        {/* Двухколоночный layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная колонка (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Изображение */}
            <Skeleton className="h-64 w-full rounded-lg" />

            {/* Категория и источник */}
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            {/* Платформа источника */}
            <Skeleton className="h-20 w-full rounded-lg" />

            {/* Описание */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Метаданные (1/3) */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
