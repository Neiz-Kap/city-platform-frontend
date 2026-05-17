"use client"

import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Bell, BellOff, FileDown, RefreshCw, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

import type { SortingState } from "@tanstack/react-table"

import { createComplaintColumns } from "@/components/entities/complaint/columns"
import { DataTable } from "@/components/features/complaint/data-table"
import { Button } from "@/components/ui/button"
import { useComplaintQueryState } from "@/lib/hooks/useComplaintQueryState"
import type { ComplaintsListFilters } from "@/lib/hooks/useComplaints"
import {
  useComplaintAggregates,
  useComplaints,
  useUpdateComplaint,
  useUpdateComplaintLabels,
} from "@/lib/hooks/useComplaints"
import { useComplaintsSocket } from "@/lib/hooks/useComplaintsSocket"
import { useLabels } from "@/lib/hooks/useLabels"
import { DEFAULT_PAGINATED_DATA } from "@/lib/mock-data/complaint.data"

import { ComplaintAggregatesBar } from "./ComplaintAggregatesBar"

function toStartOfDayIso(date: string) {
  return `${date}T00:00:00`
}

function toEndOfDayIso(date: string) {
  return `${date}T23:59:59`
}

export default function ComplaintDataTable() {
  const {
    pagination,
    sortParams,
    dashboardFilters,
    search,
    sorting,
    setPagination,
    setSorting,
    setSearch,
    setDashboardFilters,
    resetFilters,
    hasInvalidDateRange,
  } = useComplaintQueryState()

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [newComplaintsCount, setNewComplaintsCount] = useState(0)

  const { data: labels = [] } = useLabels({ with_counts: false })

  const queryParams = useMemo((): ComplaintsListFilters => {
    const base: ComplaintsListFilters = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...sortParams,
      ...(search.trim() && { q: search.trim() }),
      ...(dashboardFilters.selectedStatuses.length > 0 && {
        status: dashboardFilters.selectedStatuses,
      }),
      ...(dashboardFilters.excludeLabelIds.length > 0 && {
        exclude_label_ids: dashboardFilters.excludeLabelIds,
      }),
    }

    if (dashboardFilters.labelIds.length > 0) {
      base.label_ids = dashboardFilters.labelIds
      base.label_match = dashboardFilters.labelMatch
    }

    if (!hasInvalidDateRange && dashboardFilters.startDate && dashboardFilters.endDate) {
      return {
        ...base,
        end_date: toEndOfDayIso(dashboardFilters.endDate),
        start_date: toStartOfDayIso(dashboardFilters.startDate),
      }
    }

    return base
  }, [hasInvalidDateRange, pagination, sortParams, search, dashboardFilters])

  const { data, dataUpdatedAt, error, isFetching, isLoading, refetch } = useComplaints(queryParams)
  const { data: aggregates } = useComplaintAggregates()

  const bumpNewComplaints = useCallback(() => {
    setNewComplaintsCount((count) => count + 1)
  }, [])
  const complaintSocketSources = useMemo(() => ["all"], [])

  const { isConnected, requestUpdate } = useComplaintsSocket({
    enabled: notificationsEnabled,
    onNewComplaint: bumpNewComplaints,
    sources: complaintSocketSources,
  })

  const updateComplaint = useUpdateComplaint()
  const updateLabels = useUpdateComplaintLabels()

  const pendingComplaintId =
    (updateComplaint.isPending && updateComplaint.variables?.id != null
      ? Number(updateComplaint.variables.id)
      : null) ??
    (updateLabels.isPending && updateLabels.variables?.id != null
      ? Number(updateLabels.variables.id)
      : null)

  const columns = useMemo(
    () =>
      createComplaintColumns({
        allLabels: labels,
        onLabelIdsChange: (id, label_ids) => {
          updateLabels.mutate(
            { id, label_ids },
            {
              onError: () => toast.error("Не удалось обновить метки"),
              onSuccess: () => toast.success("Метки обновлены"),
            },
          )
        },
        onStatusChange: (id, status) => {
          updateComplaint.mutate(
            { id, body: { status } },
            {
              onError: () => toast.error("Не удалось обновить статус"),
              onSuccess: () => toast.success("Статус обновлён"),
            },
          )
        },
        pendingComplaintId,
      }),
    [labels, pendingComplaintId, updateComplaint, updateLabels],
  )

  const handlePaginationChange = useCallback(
    (newPagination: { page: number; per_page: number }) => {
      setPagination(newPagination)
    },
    [setPagination],
  )

  const handleSortChange = useCallback(
    (newSorting: SortingState) => {
      setSorting(newSorting)
    },
    [setSorting],
  )

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch)
    },
    [setSearch],
  )

  const handleManualRefresh = useCallback(() => {
    setNewComplaintsCount(0)
    refetch()
    requestUpdate()
  }, [refetch, requestUpdate])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((previous) => !previous)
    if (!notificationsEnabled) {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [notificationsEnabled])

  const toggleStatusChip = useCallback(
    (statusKey: string) => {
      const newStatuses = dashboardFilters.selectedStatuses.includes(statusKey)
        ? dashboardFilters.selectedStatuses.filter((status) => status !== statusKey)
        : [...dashboardFilters.selectedStatuses, statusKey]

      setDashboardFilters({ selectedStatuses: newStatuses })
    },
    [dashboardFilters.selectedStatuses, setDashboardFilters],
  )

  const toggleLabelChip = useCallback(
    (labelId: number) => {
      const newLabelIds = dashboardFilters.labelIds.includes(labelId)
        ? dashboardFilters.labelIds.filter((id) => id !== labelId)
        : [...dashboardFilters.labelIds, labelId]

      setDashboardFilters({ labelIds: newLabelIds })
    },
    [dashboardFilters.labelIds, setDashboardFilters],
  )

  const patchDashboardFilters = useCallback(
    (patch: Parameters<typeof setDashboardFilters>[0]) => {
      setDashboardFilters(patch)
    },
    [setDashboardFilters],
  )

  const resetAllFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  if (error && !hasInvalidDateRange) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить жалобы."
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-center text-sm text-destructive">
          Ошибка загрузки жалоб: {message}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold">Таблица жалоб</h3>
            {newComplaintsCount > 0 && (
              <span className="animate-pulse text-sm font-medium text-destructive">
                +{newComplaintsCount} новых
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-emerald-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              {notificationsEnabled
                ? isConnected
                  ? "Онлайн-канал подключён"
                  : "Онлайн-канал переподключается"
                : "Онлайн-канал выключен"}
            </span>
            {dataUpdatedAt > 0 && (
              <span>
                Обновлено{" "}
                {formatDistanceToNow(new Date(dataUpdatedAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            )}
            {isFetching && <span>Обновляем данные…</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/labels">Метки</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="PDF-отчёт: ожидается контракт API"
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Отчёт PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsEnabled ? "Уведомления включены" : "Уведомления выключены"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      <ComplaintAggregatesBar
        aggregates={aggregates}
        selectedStatuses={dashboardFilters.selectedStatuses}
        selectedLabelIds={dashboardFilters.labelIds}
        onToggleStatus={toggleStatusChip}
        onToggleLabel={toggleLabelChip}
      />

      <DataTable
        columns={columns}
        data={data ?? DEFAULT_PAGINATED_DATA}
        dashboardFilters={dashboardFilters}
        filterLabels={labels}
        isLoading={isLoading}
        onDashboardFiltersChange={patchDashboardFilters}
        onPaginationChange={handlePaginationChange}
        onResetFilters={resetAllFilters}
        onSearchQueryChange={handleSearchChange}
        onSortChange={handleSortChange}
        pagination={pagination}
        searchQuery={search}
        sorting={sorting}
        validationMessage={
          hasInvalidDateRange
            ? "Период задан некорректно: дата начала не может быть позже даты окончания. Таблица показана без фильтра по датам."
            : null
        }
      />
    </div>
  )
}
