import type { DashboardTableFilters } from "@/components/features/complaint/data-table"
import type { TimePeriod } from "@/lib/types/complaint-stats.type"

export type ComplaintDashboardUrlState = {
  dashboardFilters: DashboardTableFilters
  pagination: {
    page: number
    per_page: number
  }
  search: string
  sortParams: {
    sort_by?: string
    sort_order?: "ASC" | "DESC"
  }
}

export type ComplaintStatsUrlState = {
  page: number
  perPage: number
  period: TimePeriod
}

type SearchParamsReader = Pick<URLSearchParams, "get">

const COMPLAINT_PARAM_KEYS = {
  endDate: "complaintEndDate",
  excludeLabelIds: "complaintExcludeLabelIds",
  labelIds: "complaintLabelIds",
  labelMatch: "complaintLabelMatch",
  page: "complaintPage",
  perPage: "complaintPerPage",
  search: "complaintQ",
  sortBy: "complaintSortBy",
  sortOrder: "complaintSortOrder",
  startDate: "complaintStartDate",
  status: "complaintStatus",
} as const

const STATS_PARAM_KEYS = {
  page: "statsPage",
  perPage: "statsPerPage",
  period: "statsPeriod",
} as const

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseStringArray(value: string | null) {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseNumberArray(value: string | null) {
  return parseStringArray(value)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isFinite(item))
}

function setParam(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key)
    return
  }

  params.set(key, value)
}

function setNumberListParam(params: URLSearchParams, key: string, values: number[]) {
  setParam(
    params,
    key,
    values.length > 0 ? values.map((value) => String(value)).join(",") : undefined,
  )
}

function setStringListParam(params: URLSearchParams, key: string, values: string[]) {
  setParam(params, key, values.length > 0 ? values.join(",") : undefined)
}

function normalizePeriod(value: string | null): TimePeriod {
  if (value === "week" || value === "month") {
    return value
  }

  return "day"
}

function normalizeSortOrder(value: string | null): "ASC" | "DESC" {
  return value === "ASC" ? "ASC" : "DESC"
}

function normalizeLabelMatch(value: string | null): DashboardTableFilters["labelMatch"] {
  return value === "all" ? "all" : "any"
}

export function parseComplaintDashboardUrlState(
  searchParams: SearchParamsReader,
): ComplaintDashboardUrlState {
  return {
    dashboardFilters: {
      endDate: searchParams.get(COMPLAINT_PARAM_KEYS.endDate) ?? "",
      excludeLabelIds: parseNumberArray(
        searchParams.get(COMPLAINT_PARAM_KEYS.excludeLabelIds),
      ),
      labelIds: parseNumberArray(searchParams.get(COMPLAINT_PARAM_KEYS.labelIds)),
      labelMatch: normalizeLabelMatch(
        searchParams.get(COMPLAINT_PARAM_KEYS.labelMatch),
      ),
      selectedStatuses: parseStringArray(
        searchParams.get(COMPLAINT_PARAM_KEYS.status),
      ),
      startDate: searchParams.get(COMPLAINT_PARAM_KEYS.startDate) ?? "",
    },
    pagination: {
      page: parsePositiveInteger(searchParams.get(COMPLAINT_PARAM_KEYS.page), 1),
      per_page: parsePositiveInteger(
        searchParams.get(COMPLAINT_PARAM_KEYS.perPage),
        10,
      ),
    },
    search: searchParams.get(COMPLAINT_PARAM_KEYS.search) ?? "",
    sortParams: {
      sort_by: searchParams.get(COMPLAINT_PARAM_KEYS.sortBy) ?? "createdAt",
      sort_order: normalizeSortOrder(searchParams.get(COMPLAINT_PARAM_KEYS.sortOrder)),
    },
  }
}

export function applyComplaintDashboardUrlState(
  params: URLSearchParams,
  state: ComplaintDashboardUrlState,
) {
  const nextParams = new URLSearchParams(params)

  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.page,
    state.pagination.page > 1 ? String(state.pagination.page) : undefined,
  )
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.perPage,
    state.pagination.per_page !== 10
      ? String(state.pagination.per_page)
      : undefined,
  )
  setParam(nextParams, COMPLAINT_PARAM_KEYS.search, state.search.trim() || undefined)
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.sortBy,
    state.sortParams.sort_by && state.sortParams.sort_by !== "createdAt"
      ? state.sortParams.sort_by
      : undefined,
  )
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.sortOrder,
    state.sortParams.sort_order === "ASC" ? "ASC" : undefined,
  )
  setStringListParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.status,
    state.dashboardFilters.selectedStatuses,
  )
  setNumberListParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.labelIds,
    state.dashboardFilters.labelIds,
  )
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.labelMatch,
    state.dashboardFilters.labelMatch === "all" ? "all" : undefined,
  )
  setNumberListParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.excludeLabelIds,
    state.dashboardFilters.excludeLabelIds,
  )
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.startDate,
    state.dashboardFilters.startDate || undefined,
  )
  setParam(
    nextParams,
    COMPLAINT_PARAM_KEYS.endDate,
    state.dashboardFilters.endDate || undefined,
  )

  return nextParams
}

export function serializeComplaintDashboardUrlState(
  state: ComplaintDashboardUrlState,
) {
  return applyComplaintDashboardUrlState(new URLSearchParams(), state).toString()
}

export function parseComplaintStatsUrlState(
  searchParams: SearchParamsReader,
): ComplaintStatsUrlState {
  return {
    page: parsePositiveInteger(searchParams.get(STATS_PARAM_KEYS.page), 1),
    perPage: parsePositiveInteger(searchParams.get(STATS_PARAM_KEYS.perPage), 20),
    period: normalizePeriod(searchParams.get(STATS_PARAM_KEYS.period)),
  }
}

export function applyComplaintStatsUrlState(
  params: URLSearchParams,
  state: ComplaintStatsUrlState,
) {
  const nextParams = new URLSearchParams(params)

  setParam(
    nextParams,
    STATS_PARAM_KEYS.period,
    state.period !== "day" ? state.period : undefined,
  )
  setParam(
    nextParams,
    STATS_PARAM_KEYS.page,
    state.page > 1 ? String(state.page) : undefined,
  )
  setParam(
    nextParams,
    STATS_PARAM_KEYS.perPage,
    state.perPage !== 20 ? String(state.perPage) : undefined,
  )

  return nextParams
}

export function serializeComplaintStatsUrlState(state: ComplaintStatsUrlState) {
  return applyComplaintStatsUrlState(new URLSearchParams(), state).toString()
}
