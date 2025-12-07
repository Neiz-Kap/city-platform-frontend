"use client"

// import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useComplaints } from "@/lib/hooks/useComplaints"
import { useComplaintsSocket } from "@/lib/hooks/useComplaintsSocket"
import { ComplaintQueryParams } from "@/lib/types/complaint.type"
import { SortingState } from "@tanstack/react-table"
import { Bell, BellOff, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function ComplaintPage() {
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const [filters, setFilters] = useState<
    Pick<ComplaintQueryParams, "category" | "status">
  >({})
  const [search, setSearch] = useState<string>("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [newComplaintsCount, setNewComplaintsCount] = useState(0)
  const [sortParams, setSortParams] = useState({})

  const router = useRouter()

  const queryParams: ComplaintQueryParams = {
    page: pagination.page,
    per_page: pagination.per_page,
    ...filters,
    ...(search && { search }),
    ...sortParams,
  }

  const { data, isLoading, error, refetch } = useComplaints(queryParams)

  // Используем WebSocket для реальных обновлений
  const { isConnected, requestUpdate } = useComplaintsSocket({
    enabled: notificationsEnabled,
    sources: ["all"],
    // interval: 300, // 5 минут
  })

  // Обработчик для новых жалоб из WebSocket
  useEffect(() => {
    if (data && newComplaintsCount > 0) {
      // Сбрасываем счетчик когда данные обновляются
      setNewComplaintsCount(0)
    }
  }, [data, newComplaintsCount])

  const handlePaginationChange = useCallback(
    (newPagination: { page: number; per_page: number }) => {
      setPagination(newPagination)
    },
    [],
  )

  const handleSortChange = useCallback((sorting: SortingState) => {
    // For now, we'll just log the sorting since it's not fully implemented
    console.log("Sorting changed:", sorting)

    setSortParams({
      sort_by: sorting[0].id,
      sort_order: sorting[0].desc ? "DESC" : "ASC",
    })
  }, [])

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleFilterChange = useCallback(
    (newFilters: { category?: string[]; status?: string[] }) => {
      setFilters(newFilters)
      setPagination((prev) => ({ ...prev, page: 1 }))
    },
    [],
  )

  const handleManualRefresh = useCallback(() => {
    refetch()
    if (requestUpdate()) {
      console.log("🔄 Запрос на обновление отправлен")
    }
  }, [refetch, requestUpdate])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => !prev)
    if (!notificationsEnabled) {
      // Запрашиваем разрешение на уведомления
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [notificationsEnabled])

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500 text-center">
          Ошибка загрузки жалоб: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      {/* Панель статуса и управления */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Жалобы</h1>

          {/* Статус подключения */}
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-500" : "bg-gray-500"}
          >
            {isConnected ? "🟢 Онлайн" : "🔴 Офлайн"}
          </Badge>

          {/* Счетчик новых жалоб */}
          {newComplaintsCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              +{newComplaintsCount} новых
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Кнопка уведомлений */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {notificationsEnabled ? "Уведомления вкл" : "Уведомления выкл"}
          </Button>

          {/* Кнопка ручного обновления */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
        </div>
      </div>

      {/* DataTable */}
      {data ? (
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      ) : (
        // <DataTable<Complaint, any>
        //   getColumns={() => columns}
        //   fetchDataFn={useComplaints}
        //   idField="id"
        //   onRowClick={(complaint) => router.push(`/complaint/${complaint.id}`)}
        //   config={{
        //     enableRowSelection: true,
        //     enableSearch: true,
        //     enableDateFilter: true,
        //     enableUrlState: true,
        //   }}
        // />
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      )}
    </div>
  )
}
