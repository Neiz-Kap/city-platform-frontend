"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pagination } from "@/components/ui/pagination"
import { useComplaintStats } from "@/lib/hooks/useComplaintStats"
import { StatsQueryParams, TimePeriod } from "@/lib/types/complaint-stats.type"
import {
  applyComplaintStatsUrlState,
  parseComplaintStatsUrlState,
} from "@/lib/utils/dashboard-url-state"
import {
  getPeriodDescription,
  getTotalComplaints,
  getXAxisLabel,
  transformChartData,
} from "@/lib/utils/complaint.utils"

import { PeriodFilter } from "../features/PeriodFilter"

export default function ComplaintStatsBlock() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlState = useMemo(
    () => parseComplaintStatsUrlState(searchParams),
    [searchParams],
  )

  const replaceStatsUrl = useCallback(
    (updater: (state: ReturnType<typeof parseComplaintStatsUrlState>) => ReturnType<typeof parseComplaintStatsUrlState>) => {
      const nextState = updater(parseComplaintStatsUrlState(searchParams))
      const nextParams = applyComplaintStatsUrlState(
        new URLSearchParams(searchParams.toString()),
        nextState,
      )
      const nextQuery = nextParams.toString()
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
        scroll: false,
      })
    },
    [pathname, router, searchParams],
  )

  const queryParams: StatsQueryParams = {
    page: urlState.page,
    per_page: urlState.perPage,
    period: urlState.period,
  }

  const { data: paginatedData, isLoading, error, refetch } = useComplaintStats(queryParams)

  const handlePeriodChange = (period: TimePeriod) => {
    replaceStatsUrl((state) => ({
      ...state,
      page: 1,
      period,
    }))
  }

  const handlePageChange = (page: number) => {
    replaceStatsUrl((state) => ({
      ...state,
      page,
    }))
  }

  const chartConfig = {
    complaints: {
      color: "var(--chart-1)",
      label: "Жалобы",
    },
  } satisfies ChartConfig

  const chartData = paginatedData
    ? transformChartData(paginatedData.data, urlState.period)
    : []
  const totalComplaints = paginatedData ? getTotalComplaints(paginatedData) : 0
  const periodDescription = getPeriodDescription(urlState.period)
  const xAxisLabel = getXAxisLabel(urlState.period)

  return (
    <div className="mx-auto">
      <Card className="gap-4 py-4">
        <CardHeader className="gap-0">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Статистика жалоб</CardTitle>
              <CardDescription>{periodDescription}</CardDescription>
            </div>
            <PeriodFilter value={urlState.period} onChange={handlePeriodChange} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground flex min-h-[180px] items-center justify-center rounded-lg border border-dashed">
              Загрузка статистики...
            </div>
          ) : error ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-destructive">
                Не удалось загрузить статистику: {error instanceof Error ? error.message : "Неизвестная ошибка"}
              </p>
              <button
                type="button"
                className="text-sm font-medium underline underline-offset-4"
                onClick={() => refetch()}
              >
                Повторить попытку
              </button>
            </div>
          ) : paginatedData && chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="max-h-[150px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayKey"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => value}
                  label={{ position: "insideBottom", value: xAxisLabel }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="complaints" fill="var(--color-complaints)" radius={8} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-muted-foreground flex min-h-[180px] items-center justify-center rounded-lg border border-dashed text-sm">
              За выбранный период жалоб пока нет.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Всего жалоб: <span className="font-bold">{totalComplaints}</span>
            {paginatedData?.pagination.total && totalComplaints > 0 && (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <div className="text-muted-foreground leading-none">
            Показаны данные за {periodDescription.toLowerCase()}
          </div>
          {paginatedData?.pagination && paginatedData.pagination.total > 0 && (
            <Pagination
              pagination={paginatedData.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
