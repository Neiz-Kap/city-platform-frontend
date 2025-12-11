"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { useComplaintStats } from "@/lib/hooks/useComplaintStats"
import { StatsQueryParams, TimePeriod } from "@/lib/types/complaint-stats.type"
import {
  getPeriodDescription,
  getTotalComplaints,
  getXAxisLabel,
  transformChartData
} from "@/lib/utils/complaint.utils"
import { useState } from "react"
import { PeriodFilter } from "../features/PeriodFilter"
import { Pagination } from "../ui/pagination"

export default function ComplaintStatsBlock() {
  // const searchParams = useSearchParams()
  // const router = useRouter()

  // // Инициализация состояния из URL параметров или значений по умолчанию
  // const urlPeriod = searchParams.get("period") as TimePeriod | null
  // const urlPage = searchParams.get("page")
  // const urlPerPage = searchParams.get("per_page")

  const [period, setPeriod] = useState<TimePeriod>("day")
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(20)

  // // Обновление URL при изменении параметров
  // useEffect(() => {
  //   const params = new URLSearchParams()
  //   params.set("period", period)
  //   params.set("page", page.toString())
  //   params.set("per_page", perPage.toString())

  //   router.push(`?${params.toString()}`, { scroll: false })
  // }, [period, page, perPage, router])

  const queryParams: StatsQueryParams = {
    period,
    page,
    per_page: perPage,
  }

  const { data: paginatedData, isLoading, error } = useComplaintStats(queryParams)

  const handlePeriodChange = (value: TimePeriod) => {
    if (period !== value) {
      setPeriod(value)
      setPage(1) // Сброс на первую страницу при смене периода
    }
  }

  // Обработка изменения страницы
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Конфигурация графика
  const chartConfig = {
    complaints: {
      label: "Жалобы",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  // Преобразованные данные для графика
  const chartData = paginatedData
    ? transformChartData(paginatedData.data, period)
    : []

  // Общее количество жалоб
  const totalComplaints = paginatedData ? getTotalComplaints(paginatedData) : 0

  // Описание периода
  const periodDescription = getPeriodDescription(period)

  // Название оси X
  const xAxisLabel = getXAxisLabel(period)

  return (
    <div className="mx-auto">
      <Card className="py-4 gap-4">
        <CardHeader className="gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Статистика жалоб</CardTitle>
              <CardDescription>{periodDescription}</CardDescription>
            </div>
            <PeriodFilter value={period} onChange={handlePeriodChange} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="p-6 flex items-center justify-center">
              <p>Загрузка статистики...</p>
            </div>
          )}
          {error && (
            <div className="p-6 flex items-center justify-center">
              <p className="text-red-500">Ошибка при загрузке статистики</p>
            </div>
          )}

          {paginatedData && (
            <ChartContainer
              config={chartConfig}
              className="max-h-[150px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayKey"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => value}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="complaints"
                  fill="var(--color-complaints)"
                  radius={8}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Всего жалоб: <span className="font-bold">{totalComplaints}</span>
            {paginatedData?.pagination.total && totalComplaints > 0 && (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <div className="text-muted-foreground leading-none">
            Показаны данные за {periodDescription.toLowerCase()}
          </div>
          {paginatedData?.pagination && (
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
