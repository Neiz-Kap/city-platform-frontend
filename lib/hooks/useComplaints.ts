import type { QueryClient } from "@tanstack/react-query"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

export type ComplaintsListFilters = ComplaintQueryParams & {
  end_date?: string
  start_date?: string
}

export const complaintKeys = {
  all: ["complaints"] as const,
  detail: (id: string) => [...complaintKeys.details(), id] as const,
  details: () => [...complaintKeys.all, "detail"] as const,
  list: (filters: ComplaintsListFilters) => [...complaintKeys.lists(), { filters }] as const,
  lists: () => [...complaintKeys.all, "list"] as const,
}

export const complaintAggregatesKey = ["complaints", "aggregates"] as const
export const complaintStatusesKey = ["complaints", "statuses"] as const

function isDateRange(p: ComplaintsListFilters): p is ComplaintsByDatesParams {
  return Boolean(p.start_date && p.end_date)
}

function patchComplaintInAllCaches(
  queryClient: QueryClient,
  id: number,
  patch: Partial<Complaint>,
) {
  queryClient.setQueryData<Complaint>(complaintKeys.detail(String(id)), (old) =>
    old ? { ...old, ...patch } : old,
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

function patchStatusAggregates(queryClient: QueryClient, prevStatus: string, nextStatus: string) {
  if (prevStatus === nextStatus) return
  queryClient.setQueryData<ComplaintsAggregates | undefined>(complaintAggregatesKey, (agg) => {
    if (!agg) return agg
    const counts = { ...agg.counts_by_status }
    counts[prevStatus] = Math.max(0, (counts[prevStatus] ?? 0) - 1)
    counts[nextStatus] = (counts[nextStatus] ?? 0) + 1
    return { ...agg, counts_by_status: counts }
  })
}

function findCachedComplaint(queryClient: QueryClient, id: number): Complaint | undefined {
  const fromDetail = queryClient.getQueryData<Complaint>(complaintKeys.detail(String(id)))
  if (fromDetail) return fromDetail

  for (const [, page] of queryClient.getQueriesData<PaginatedData<Complaint>>({
    queryKey: complaintKeys.lists(),
  })) {
    const hit = page?.data?.find((c) => c.id === id)
    if (hit) return hit
  }
  return undefined
}

export const useComplaints = (params: ComplaintsListFilters = {}) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => {
      if (isDateRange(params)) return ComplaintAPI.getByDateRange(params)
      const nextParams = { ...params }
      delete nextParams.start_date
      delete nextParams.end_date
      return ComplaintAPI.getAll(nextParams)
    },
    queryKey: complaintKeys.list(params),
    staleTime: 5 * 60 * 1000,
  })

export const useComplaint = (id: string) => {
  const queryClient = useQueryClient()
  return useQuery<Complaint>({
    enabled: Boolean(id),
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
      const timestamps = queryClient
        .getQueryCache()
        .findAll({ queryKey: complaintKeys.lists() })
        .map((query) => query.state.dataUpdatedAt)
      return timestamps.length > 0 ? Math.max(...timestamps) : 0
    },
    queryFn: () => ComplaintAPI.getById(id),
    queryKey: complaintKeys.detail(id),
    staleTime: 5 * 60 * 1000,
  })
}

export const useComplaintAggregates = () =>
  useQuery({
    queryFn: () => ComplaintAPI.getAggregates(),
    queryKey: complaintAggregatesKey,
    staleTime: 60 * 1000,
  })

export const useComplaintStatusesFromApi = () =>
  useQuery({
    queryFn: () => ComplaintAPI.getStatuses(),
    queryKey: complaintStatusesKey,
    staleTime: 10 * 60 * 1000,
  })

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

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { body: UpdateComplaintRequest; id: number }) =>
      ComplaintAPI.update(id, body),
    onSuccess: (_apiResponse, { id, body }) => {
      const patch = { ...body }
      delete patch.label_ids
      if (Object.keys(patch).length === 0) return

      const prev = findCachedComplaint(queryClient, id)
      patchComplaintInAllCaches(queryClient, id, patch)

      if (patch.status && prev?.status && prev.status !== patch.status) {
        patchStatusAggregates(queryClient, prev.status, patch.status)
      }
    },
  })
}

export const useUpdateComplaintLabels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label_ids }: { id: number; label_ids: number[] }) =>
      ComplaintAPI.updateLabels(id, label_ids),
    onSuccess: (data, { id }) => {
      patchComplaintInAllCaches(queryClient, id, {
        labels: data.labels ?? [],
      })
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
