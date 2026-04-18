"use client"

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
import { useComplaintsSocket } from "@/lib/hooks/useComplaintsSocket"
import { useLabels } from "@/lib/hooks/useLabels"
import { DEFAULT_PAGINATED_DATA } from "@/lib/mock-data/complaint.data"
import type { ComplaintsListFilters } from "@/lib/hooks/useComplaints"
import {
  COMPLAINT_STATUS_LABELS,
  ComplaintStatus,
} from "@/lib/types/complaint-status.type"
import { SortingState } from "@tanstack/react-table"
import { Bell, BellOff, FileDown, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ComplaintAggregatesBar } from "./ComplaintAggregatesBar"

function toStartOfDayIso(d: string): string {
  return `${d}T00:00:00`
}

function toEndOfDayIso(d: string): string {
  return `${d}T23:59:59`
}

const DEFAULT_TABLE_SORT: SortingState = [{ id: "createdAt", desc: true }]

const STATUS_FILTER_OPTIONS = [
  { value: ComplaintStatus.BACKLOG, label: COMPLAINT_STATUS_LABELS[ComplaintStatus.BACKLOG] },
  {
    value: ComplaintStatus.IN_PROGRESS,
    label: COMPLAINT_STATUS_LABELS[ComplaintStatus.IN_PROGRESS],
  },
  { value: ComplaintStatus.DONE, label: COMPLAINT_STATUS_LABELS[ComplaintStatus.DONE] },
]

export default function ComplaintDataTable() {
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const [search, setSearch] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [newComplaintsCount, setNewComplaintsCount] = useState(0)
  const [sortParams, setSortParams] = useState<{
    sort_by?: string
    sort_order?: "ASC" | "DESC"
  }>({ sort_by: "createdAt", sort_order: "DESC" })

  const [dashboardFilters, setDashboardFilters] = useState<DashboardTableFilters>(
    {
      selectedStatuses: [],
      labelIds: [],
      labelMatch: "any",
      excludeLabelIds: [],
      startDate: "",
      endDate: "",
    },
  )

  const patchDashboardFilters = useCallback(
    (patch: Partial<DashboardTableFilters>) => {
      setDashboardFilters((prev) => ({ ...prev, ...patch }))
      setPagination((p) => ({ ...p, page: 1 }))
    },
    [],
  )

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

    if (dashboardFilters.startDate && dashboardFilters.endDate) {
      return {
        ...base,
        start_date: toStartOfDayIso(dashboardFilters.startDate),
        end_date: toEndOfDayIso(dashboardFilters.endDate),
      }
    }

    return base
  }, [pagination, sortParams, search, dashboardFilters])

  const { data, isLoading, error, refetch } = useComplaints(queryParams)
  const { data: aggregates } = useComplaintAggregates()

  const bumpNewComplaints = useCallback(() => {
    setNewComplaintsCount((c) => c + 1)
  }, [])

  const { requestUpdate } = useComplaintsSocket({
    enabled: notificationsEnabled,
    sources: ["all"],
    onNewComplaint: bumpNewComplaints,
  })

  useEffect(() => {
    if (data && newComplaintsCount > 0) {
      setNewComplaintsCount(0)
    }
  }, [data, newComplaintsCount])

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
        pendingComplaintId,
        onStatusChange: (id, status) => {
          updateComplaint.mutate(
            { id, body: { status } },
            {
              onSuccess: () => toast.success("Статус обновлён"),
              onError: () => toast.error("Не удалось обновить статус"),
            },
          )
        },
        onLabelIdsChange: (id, label_ids) => {
          updateLabels.mutate(
            { id, label_ids },
            {
              onSuccess: () => toast.success("Метки обновлены"),
              onError: () => toast.error("Не удалось обновить метки"),
            },
          )
        },
      }),
    [labels, pendingComplaintId, updateComplaint, updateLabels],
  )

  const handlePaginationChange = useCallback(
    (newPagination: { page: number; per_page: number }) => {
      setPagination(newPagination)
    },
    [],
  )

  const handleSortChange = useCallback((sorting: SortingState) => {
    const col = sorting[0]
    if (!col) {
      setSortParams({ sort_by: "createdAt", sort_order: "DESC" })
      return
    }
    const idMap: Record<string, string> = {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      status: "status",
      label: "label",
      category: "category",
      name: "name",
      id: "id",
    }
    const sort_by = idMap[col.id] ?? "createdAt"
    setSortParams({
      sort_by,
      sort_order: col.desc ? "DESC" : "ASC",
    })
    setPagination((p) => ({ ...p, page: 1 }))
  }, [])

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleManualRefresh = useCallback(() => {
    refetch()
    requestUpdate()
  }, [refetch, requestUpdate])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => !prev)
    if (!notificationsEnabled) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [notificationsEnabled])

  const toggleStatusChip = useCallback((statusKey: string) => {
    setDashboardFilters((prev) => {
      const next = prev.selectedStatuses.includes(statusKey)
        ? prev.selectedStatuses.filter((s) => s !== statusKey)
        : [...prev.selectedStatuses, statusKey]
      return { ...prev, selectedStatuses: next }
    })
    setPagination((p) => ({ ...p, page: 1 }))
  }, [])

  const toggleLabelChip = useCallback((labelId: number) => {
    setDashboardFilters((prev) => {
      const next = prev.labelIds.includes(labelId)
        ? prev.labelIds.filter((id) => id !== labelId)
        : [...prev.labelIds, labelId]
      return { ...prev, labelIds: next }
    })
    setPagination((p) => ({ ...p, page: 1 }))
  }, [])

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
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl font-bold">Таблица жалоб</h3>

          {newComplaintsCount > 0 && (
            <span className="text-sm font-medium text-destructive animate-pulse">
              +{newComplaintsCount} новых
            </span>
          )}
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
            {notificationsEnabled ? "Уведомления вкл" : "Уведомления выкл"}
          </Button>

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
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        searchQuery={search}
        onSearchQueryChange={handleSearchChange}
        statusOptions={STATUS_FILTER_OPTIONS}
        filterLabels={labels}
        dashboardFilters={dashboardFilters}
        onDashboardFiltersChange={patchDashboardFilters}
        isLoading={isLoading}
        initialSorting={DEFAULT_TABLE_SORT}
      />
    </div>
  )
}
