"use client"

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
  type UrlKeys,
} from "nuqs"
import { useMemo } from "react"

import type { DashboardTableFilters } from "@/components/features/complaint/data-table"
import type { SortingState } from "@tanstack/react-table"

// URL parameter keys (shortened for cleaner URLs)
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

// Parser definitions
const complaintParsers = {
  // Pagination
  page: parseAsInteger.withDefault(1),
  per_page: parseAsInteger.withDefault(10),

  // Search
  search: parseAsString.withDefault(""),

  // Sorting
  sort_by: parseAsString.withDefault("createdAt"),
  sort_order: parseAsStringLiteral(["ASC", "DESC"] as const).withDefault("DESC"),

  // Filters
  startDate: parseAsString.withDefault(""),
  endDate: parseAsString.withDefault(""),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  labelIds: parseAsArrayOf(parseAsInteger).withDefault([]),
  labelMatch: parseAsStringLiteral(["any", "all"] as const).withDefault("any"),
  excludeLabelIds: parseAsArrayOf(parseAsInteger).withDefault([]),
}

// Map internal state keys to URL query keys
const urlKeys: UrlKeys<typeof complaintParsers> = {
  page: COMPLAINT_PARAM_KEYS.page,
  per_page: COMPLAINT_PARAM_KEYS.perPage,
  search: COMPLAINT_PARAM_KEYS.search,
  sort_by: COMPLAINT_PARAM_KEYS.sortBy,
  sort_order: COMPLAINT_PARAM_KEYS.sortOrder,
  startDate: COMPLAINT_PARAM_KEYS.startDate,
  endDate: COMPLAINT_PARAM_KEYS.endDate,
  status: COMPLAINT_PARAM_KEYS.status,
  labelIds: COMPLAINT_PARAM_KEYS.labelIds,
  labelMatch: COMPLAINT_PARAM_KEYS.labelMatch,
  excludeLabelIds: COMPLAINT_PARAM_KEYS.excludeLabelIds,
}

export type ComplaintQueryState = {
  page: number
  per_page: number
  search: string
  sort_by: string
  sort_order: "ASC" | "DESC"
  startDate: string
  endDate: string
  status: string[]
  labelIds: number[]
  labelMatch: "any" | "all"
  excludeLabelIds: number[]
}

export interface UseComplaintQueryStateReturn {
  // Raw state values
  state: ComplaintQueryState

  // Derived values for convenience
  pagination: { page: number; per_page: number }
  sortParams: { sort_by: string; sort_order: "ASC" | "DESC" }
  dashboardFilters: DashboardTableFilters
  search: string
  sorting: SortingState

  // State updaters
  setState: (
    updater:
      | Partial<ComplaintQueryState>
      | ((prev: ComplaintQueryState) => Partial<ComplaintQueryState>)
      | null,
  ) => Promise<URLSearchParams>

  // Helper setters
  setPagination: (pagination: { page: number; per_page: number }) => Promise<URLSearchParams>
  setSorting: (sorting: SortingState) => Promise<URLSearchParams>
  setSearch: (search: string) => Promise<URLSearchParams>
  setDashboardFilters: (filters: Partial<DashboardTableFilters>) => Promise<URLSearchParams>
  resetFilters: () => Promise<URLSearchParams>

  // Validation
  hasInvalidDateRange: boolean
}

export function useComplaintQueryState(): UseComplaintQueryStateReturn {
  const [rawState, setState] = useQueryStates(complaintParsers, {
    urlKeys,
    history: "replace",
  })

  // Construct the full state object
  const state: ComplaintQueryState = useMemo(
    () => ({
      page: rawState.page,
      per_page: rawState.per_page,
      search: rawState.search,
      sort_by: rawState.sort_by,
      sort_order: rawState.sort_order,
      startDate: rawState.startDate,
      endDate: rawState.endDate,
      status: rawState.status,
      labelIds: rawState.labelIds,
      labelMatch: rawState.labelMatch,
      excludeLabelIds: rawState.excludeLabelIds,
    }),
    [rawState],
  )

  // Derived pagination object
  const pagination = useMemo(
    () => ({ page: state.page, per_page: state.per_page }),
    [state.page, state.per_page],
  )

  // Derived sort params
  const sortParams = useMemo(
    () => ({ sort_by: state.sort_by, sort_order: state.sort_order }),
    [state.sort_by, state.sort_order],
  )

  // Derived dashboard filters (compatible with existing DataTable interface)
  const dashboardFilters: DashboardTableFilters = useMemo(
    () => ({
      startDate: state.startDate,
      endDate: state.endDate,
      selectedStatuses: state.status,
      labelIds: state.labelIds,
      labelMatch: state.labelMatch,
      excludeLabelIds: state.excludeLabelIds,
    }),
    [state.startDate, state.endDate, state.status, state.labelIds, state.labelMatch, state.excludeLabelIds],
  )

  // TanStack Table compatible sorting state
  const sorting: SortingState = useMemo(
    () => [{ id: state.sort_by, desc: state.sort_order !== "ASC" }],
    [state.sort_by, state.sort_order],
  )

  // Validation: check for invalid date range
  const hasInvalidDateRange = useMemo(() => {
    if (!state.startDate || !state.endDate) return false
    return state.startDate > state.endDate
  }, [state.startDate, state.endDate])

  // Helper: set pagination (resets to page 1 when changing per_page implicitly via page reset)
  const setPagination = async (newPagination: { page: number; per_page: number }) => {
    return setState({
      page: newPagination.page,
      per_page: newPagination.per_page,
    })
  }

  // Helper: set sorting from TanStack Table SortingState
  const setSorting = async (newSorting: SortingState) => {
    const column = newSorting[0]
    const sortMap: Record<string, string> = {
      createdAt: "createdAt",
      id: "id",
      label: "label",
      name: "name",
      status: "status",
      updatedAt: "updatedAt",
    }

    if (column) {
      return setState({
        sort_by: sortMap[column.id] ?? "createdAt",
        sort_order: column.desc ? "DESC" : "ASC",
        page: 1, // Reset to first page on sort change
      })
    }

    return setState({
      sort_by: "createdAt",
      sort_order: "DESC",
      page: 1,
    })
  }

  // Helper: set search query
  const setSearch = async (search: string) => {
    return setState({
      search,
      page: 1, // Reset to first page on search
    })
  }

  // Helper: update dashboard filters
  const setDashboardFilters = async (filters: Partial<DashboardTableFilters>) => {
    const updates: Partial<ComplaintQueryState> = {}

    if (filters.startDate !== undefined) updates.startDate = filters.startDate
    if (filters.endDate !== undefined) updates.endDate = filters.endDate
    if (filters.selectedStatuses !== undefined) updates.status = filters.selectedStatuses
    if (filters.labelIds !== undefined) updates.labelIds = filters.labelIds
    if (filters.labelMatch !== undefined) updates.labelMatch = filters.labelMatch
    if (filters.excludeLabelIds !== undefined) updates.excludeLabelIds = filters.excludeLabelIds

    return setState({
      ...updates,
      page: 1, // Reset to first page on filter change
    })
  }

  // Helper: reset all filters to defaults
  const resetFilters = async () => {
    return setState({
      page: 1,
      search: "",
      sort_by: "createdAt",
      sort_order: "DESC",
      startDate: "",
      endDate: "",
      status: [],
      labelIds: [],
      labelMatch: "any",
      excludeLabelIds: [],
    })
  }

  return {
    state,
    pagination,
    sortParams,
    dashboardFilters,
    search: state.search,
    sorting,
    setState,
    setPagination,
    setSorting,
    setSearch,
    setDashboardFilters,
    resetFilters,
    hasInvalidDateRange,
  }
}
