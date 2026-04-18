import type { QueryClient } from "@tanstack/react-query"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PaginatedData } from "@/lib/types"
import {
  type Complaint,
  type ComplaintQueryParams,
  type ComplaintsAggregates,
  type ComplaintsByDatesParams,
  type CreateComplaintRequest,
  type UpdateComplaintRequest,
} from "@/lib/types/complaint.type"
import { ComplaintAPI } from "../api/complaint.api"

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export type ComplaintsListFilters = ComplaintQueryParams & {
  start_date?: string
  end_date?: string
}

export const complaintKeys = {
  all: ["complaints"] as const,
  lists: () => [...complaintKeys.all, "list"] as const,
  list: (filters: ComplaintsListFilters) =>
    [...complaintKeys.lists(), { filters }] as const,
  details: () => [...complaintKeys.all, "detail"] as const,
  detail: (id: string) => [...complaintKeys.details(), id] as const,
}

export const complaintAggregatesKey = ["complaints", "aggregates"] as const
export const complaintStatusesKey = ["complaints", "statuses"] as const

// ---------------------------------------------------------------------------
// Internal helpers (not exported)
// ---------------------------------------------------------------------------

function isDateRange(p: ComplaintsListFilters): p is ComplaintsByDatesParams {
  return Boolean(p.start_date && p.end_date)
}

/** Patch a complaint in the detail cache and all list caches. */
function patchComplaintInAllCaches(
  queryClient: QueryClient,
  id: number,
  patch: Partial<Complaint>,
) {
  queryClient.setQueryData<Complaint>(
    complaintKeys.detail(String(id)),
    (old) => (old ? { ...old, ...patch } : old),
  )

  queryClient.setQueriesData<PaginatedData<Complaint>>(
    { queryKey: complaintKeys.lists() },
    (old) => {
      if (!old?.data) return old
      return {
        ...old,
        data: old.data.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }
    },
  )
}

/** Adjust counts_by_status in the aggregates cache without a re-fetch. */
function patchStatusAggregates(
  queryClient: QueryClient,
  prevStatus: string,
  nextStatus: string,
) {
  if (prevStatus === nextStatus) return
  queryClient.setQueryData<ComplaintsAggregates | undefined>(
    complaintAggregatesKey,
    (agg) => {
      if (!agg) return agg
      const counts = { ...agg.counts_by_status }
      counts[prevStatus] = Math.max(0, (counts[prevStatus] ?? 0) - 1)
      counts[nextStatus] = (counts[nextStatus] ?? 0) + 1
      return { ...agg, counts_by_status: counts }
    },
  )
}

/** Look up the current complaint from any cached query. */
function findCachedComplaint(
  queryClient: QueryClient,
  id: number,
): Complaint | undefined {
  const fromDetail = queryClient.getQueryData<Complaint>(
    complaintKeys.detail(String(id)),
  )
  if (fromDetail) return fromDetail

  for (const [, page] of queryClient.getQueriesData<PaginatedData<Complaint>>({
    queryKey: complaintKeys.lists(),
  })) {
    const hit = page?.data?.find((c) => c.id === id)
    if (hit) return hit
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useComplaints = (params: ComplaintsListFilters = {}) =>
  useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => {
      if (isDateRange(params)) return ComplaintAPI.getByDateRange(params)
      const { start_date: _s, end_date: _e, ...rest } = params
      return ComplaintAPI.getAll(rest)
    },
    staleTime: 5 * 60 * 1000,
  })

export const useComplaint = (id: string) => {
  const queryClient = useQueryClient()
  return useQuery<Complaint>({
    queryKey: complaintKeys.detail(id),
    queryFn: () => ComplaintAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: (): Complaint | undefined => {
      for (const query of queryClient
        .getQueryCache()
        .findAll({ queryKey: complaintKeys.lists() })) {
        const data = query.state.data as { data?: Complaint[] } | undefined
        const hit = data?.data?.find((c) => c.id.toString() === id)
        if (hit) return hit
      }
      return undefined
    },
    initialDataUpdatedAt: () => {
      const ts = queryClient
        .getQueryCache()
        .findAll({ queryKey: complaintKeys.lists() })
        .map((q) => q.state.dataUpdatedAt)
      return ts.length > 0 ? Math.max(...ts) : 0
    },
  })
}

export const useComplaintAggregates = () =>
  useQuery({
    queryKey: complaintAggregatesKey,
    queryFn: () => ComplaintAPI.getAggregates(),
    staleTime: 60 * 1000,
  })

export const useComplaintStatusesFromApi = () =>
  useQuery({
    queryKey: complaintStatusesKey,
    queryFn: () => ComplaintAPI.getStatuses(),
    staleTime: 10 * 60 * 1000,
  })

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateComplaint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateComplaintRequest) => ComplaintAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintAggregatesKey })
    },
  })
}

/**
 * Update status / name / description / category of a complaint.
 * Does NOT update labels – use `useUpdateComplaintLabels` for that.
 * Applies changes directly to all caches (no re-fetch).
 */
export const useUpdateComplaint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number
      body: UpdateComplaintRequest
    }) => ComplaintAPI.update(id, body),
    onSuccess: (_apiResponse, { id, body }) => {
      const { label_ids: _ignored, ...patch } = body
      if (Object.keys(patch).length === 0) return

      const prev = findCachedComplaint(queryClient, id)
      patchComplaintInAllCaches(queryClient, id, patch)

      if (patch.status && prev?.status && prev.status !== patch.status) {
        patchStatusAggregates(queryClient, prev.status, patch.status)
      }
    },
  })
}

/**
 * Replace the label set of a complaint via the dedicated `/labels` endpoint.
 * Uses the server's response (which includes the updated labels array).
 */
export const useUpdateComplaintLabels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      label_ids,
    }: {
      id: number
      label_ids: number[]
    }) => ComplaintAPI.updateLabels(id, label_ids),
    onSuccess: (data, { id }) => {
      patchComplaintInAllCaches(queryClient, id, {
        labels: data.labels ?? [],
      })
      // Aggregate label counts are complex to diff; invalidate once.
      queryClient.invalidateQueries({ queryKey: complaintAggregatesKey })
    },
  })
}

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ComplaintAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintAggregatesKey })
    },
  })
}
