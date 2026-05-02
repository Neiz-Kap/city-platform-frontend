"use client"

import { SortingState } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Bell, BellOff, FileDown, RefreshCw, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

import { createComplaintColumns } from "@/components/entities/complaint/columns"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  type DashboardTableFilters,
} from "@/components/features/complaint/data-table"
import {
  useComplaintAggregates,
  useComplaints,
  useUpdateComplaint,
  useUpdateComplaintLabels,
} from "@/lib/hooks/useComplaints"
import type { ComplaintsListFilters } from "@/lib/hooks/useComplaints"
import { useComplaintsSocket } from "@/lib/hooks/useComplaintsSocket"
import { useLabels } from "@/lib/hooks/useLabels"
import { DEFAULT_PAGINATED_DATA } from "@/lib/mock-data/complaint.data"
import {
  applyComplaintDashboardUrlState,
  parseComplaintDashboardUrlState,
} from "@/lib/utils/dashboard-url-state"

import { ComplaintAggregatesBar } from "./ComplaintAggregatesBar"

function toStartOfDayIso(date: string) {
  return `${date}T00:00:00`
}

function toEndOfDayIso(date: string) {
  return `${date}T23:59:59`
}

const DEFAULT_TABLE_SORT: SortingState = [{ id: "createdAt", desc: true }]
const DEFAULT_FILTERS: DashboardTableFilters = {
  endDate: "",
  excludeLabelIds: [],
  labelIds: [],
  labelMatch: "any",
  selectedStatuses: [],
  startDate: "",
}

function getSortingState(sort_by?: string, sort_order?: "ASC" | "DESC") {
  return [{ id: sort_by ?? "createdAt", desc: sort_order !== "ASC" }]
}

export default function ComplaintDataTable() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlState = useMemo(
    () => parseComplaintDashboardUrlState(searchParams),
    [searchParams],
  )
  const hasInvalidDateRange =
    Boolean(urlState.dashboardFilters.startDate) &&
    Boolean(urlState.dashboardFilters.endDate) &&
    urlState.dashboardFilters.startDate > urlState.dashboardFilters.endDate

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [newComplaintsCount, setNewComplaintsCount] = useState(0)

  const replaceUrlState = useCallback(
    (
      updater: (
        state: ReturnType<typeof parseComplaintDashboardUrlState>,
      ) => ReturnType<typeof parseComplaintDashboardUrlState>,
    ) => {
      const nextState = updater(parseComplaintDashboardUrlState(searchParams))
      const nextParams = applyComplaintDashboardUrlState(
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

  const { data: labels = [] } = useLabels({ with_counts: false })

  const queryParams = useMemo((): ComplaintsListFilters => {
    const base: ComplaintsListFilters = {
      page: urlState.pagination.page,
      per_page: urlState.pagination.per_page,
      ...urlState.sortParams,
      ...(urlState.search.trim() && { q: urlState.search.trim() }),
      ...(urlState.dashboardFilters.selectedStatuses.length > 0 && {
        status: urlState.dashboardFilters.selectedStatuses,
      }),
      ...(urlState.dashboardFilters.excludeLabelIds.length > 0 && {
        exclude_label_ids: urlState.dashboardFilters.excludeLabelIds,
      }),
    }

    if (urlState.dashboardFilters.labelIds.length > 0) {
      base.label_ids = urlState.dashboardFilters.labelIds
      base.label_match = urlState.dashboardFilters.labelMatch
    }

    if (
      !hasInvalidDateRange &&
      urlState.dashboardFilters.startDate &&
      urlState.dashboardFilters.endDate
    ) {
      return {
        ...base,
        end_date: toEndOfDayIso(urlState.dashboardFilters.endDate),
        start_date: toStartOfDayIso(urlState.dashboardFilters.startDate),
      }
    }

    return base
  }, [hasInvalidDateRange, urlState])

  const {
    data,
    dataUpdatedAt,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useComplaints(queryParams)
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
    (pagination: { page: number; per_page: number }) => {
      replaceUrlState((state) => ({
        ...state,
        pagination,
      }))
    },
    [replaceUrlState],
  )

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      const column = sorting[0]
      const sortMap: Record<string, string> = {
        createdAt: "createdAt",
        id: "id",
        label: "label",
        name: "name",
        status: "status",
        updatedAt: "updatedAt",
      }

      replaceUrlState((state) => ({
        ...state,
        pagination: { ...state.pagination, page: 1 },
        sortParams: column
          ? {
              sort_by: sortMap[column.id] ?? "createdAt",
              sort_order: column.desc ? "DESC" : "ASC",
            }
          : { sort_by: "createdAt", sort_order: "DESC" },
      }))
    },
    [replaceUrlState],
  )

  const handleSearchChange = useCallback(
    (search: string) => {
      replaceUrlState((state) => ({
        ...state,
        pagination: { ...state.pagination, page: 1 },
        search,
      }))
    },
    [replaceUrlState],
  )

  const handleManualRefresh = useCallback(() => {
    setNewComplaintsCount(0)
    refetch()
    requestUpdate()
  }, [refetch, requestUpdate])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((previous) => !previous)
    if (!notificationsEnabled) {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission()
      }
    }
  }, [notificationsEnabled])

  const toggleStatusChip = useCallback(
    (statusKey: string) => {
      replaceUrlState((state) => ({
        ...state,
        dashboardFilters: {
          ...state.dashboardFilters,
          selectedStatuses: state.dashboardFilters.selectedStatuses.includes(statusKey)
            ? state.dashboardFilters.selectedStatuses.filter(
                (status) => status !== statusKey,
              )
            : [...state.dashboardFilters.selectedStatuses, statusKey],
        },
        pagination: { ...state.pagination, page: 1 },
      }))
    },
    [replaceUrlState],
  )

  const toggleLabelChip = useCallback(
    (labelId: number) => {
      replaceUrlState((state) => ({
        ...state,
        dashboardFilters: {
          ...state.dashboardFilters,
          labelIds: state.dashboardFilters.labelIds.includes(labelId)
            ? state.dashboardFilters.labelIds.filter((id) => id !== labelId)
            : [...state.dashboardFilters.labelIds, labelId],
        },
        pagination: { ...state.pagination, page: 1 },
      }))
    },
    [replaceUrlState],
  )

  const patchDashboardFilters = useCallback(
    (patch: Partial<DashboardTableFilters>) => {
      replaceUrlState((state) => ({
        ...state,
        dashboardFilters: {
          ...state.dashboardFilters,
          ...patch,
        },
        pagination: { ...state.pagination, page: 1 },
      }))
    },
    [replaceUrlState],
  )

  const resetAllFilters = useCallback(() => {
    replaceUrlState((state) => ({
      ...state,
      dashboardFilters: DEFAULT_FILTERS,
      pagination: { page: 1, per_page: state.pagination.per_page },
      search: "",
      sortParams: { sort_by: "createdAt", sort_order: "DESC" },
    }))
  }, [replaceUrlState])

  if (error && !hasInvalidDateRange) {
    const message =
      error instanceof Error ? error.message : "Не удалось загрузить жалобы."
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
                Обновлено {formatDistanceToNow(new Date(dataUpdatedAt), {
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
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
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
        selectedStatuses={urlState.dashboardFilters.selectedStatuses}
        selectedLabelIds={urlState.dashboardFilters.labelIds}
        onToggleStatus={toggleStatusChip}
        onToggleLabel={toggleLabelChip}
      />

      <DataTable
        columns={columns}
        data={data ?? DEFAULT_PAGINATED_DATA}
        dashboardFilters={urlState.dashboardFilters}
        filterLabels={labels}
        initialSorting={DEFAULT_TABLE_SORT}
        isLoading={isLoading}
        onDashboardFiltersChange={patchDashboardFilters}
        onPaginationChange={handlePaginationChange}
        onResetFilters={resetAllFilters}
        onSearchQueryChange={handleSearchChange}
        onSortChange={handleSortChange}
        pagination={urlState.pagination}
        searchQuery={urlState.search}
        sorting={getSortingState(
          urlState.sortParams.sort_by,
          urlState.sortParams.sort_order,
        )}
        validationMessage={
          hasInvalidDateRange
            ? "Период задан некорректно: дата начала не может быть позже даты окончания. Таблица показана без фильтра по датам."
            : null
        }
      />
    </div>
  )
}
