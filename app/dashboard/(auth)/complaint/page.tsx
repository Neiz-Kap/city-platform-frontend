"use client"

import { Loader2 } from "lucide-react"

import { ComplaintEmpty } from "@/components/entities/complaint/ComplaintEmpty"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import ComplaintDataTable from "@/components/widgets/ComplaintDataTable"
import ComplaintStatsBlock from "@/components/widgets/ComplaintStatsBlock"
import { useComplaints } from "@/lib/hooks/useComplaints"

/**
 * Loading skeleton for the complaints page
 */
function ComplaintPageLoader() {
  return (
    <div className="space-y-6">
      {/* Stats block skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[150px] w-full" />
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Data table skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Загрузка жалоб...</span>
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ComplaintPage() {
  // Fetch complaints data to check if we have any data
  const { data, isLoading, isFetching, refetch } = useComplaints({
    page: 1,
    per_page: 1,
  })

  const hasNoComplaints = !isLoading && data?.data.length === 0

  // Show loader while checking for data
  if (isLoading) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Жалобы</h1>
        <ComplaintPageLoader />
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Жалобы</h1>

      {hasNoComplaints ? (
        <ComplaintEmpty
          isRefreshing={isFetching}
          onRefresh={refetch}
        />
      ) : (
        <>
          <ComplaintStatsBlock />
          <ComplaintDataTable />
        </>
      )}
    </section>
  )
}
