import { LabelAPI } from "@/lib/api/labels.api"
import type {
  CreateLabelRequest,
  DashboardLabel,
  UpdateLabelRequest,
} from "@/lib/types/complaint-label.type"
import type {
  Complaint,
  ComplaintsAggregates,
} from "@/lib/types/complaint.type"
import type { PaginatedData } from "@/lib/types"
import {
  mergeCreatedLabelIntoAggregates,
  patchComplaintLabelsMeta,
  patchLabelInAggregates,
  removeLabelFromAggregates,
  stripLabelFromComplaint,
} from "@/lib/utils/complaint-cache-helpers"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  complaintAggregatesKey,
  complaintKeys,
} from "./useComplaints"

export const labelKeys = {
  all: ["labels"] as const,
  list: (withCounts?: boolean) =>
    [...labelKeys.all, "list", { withCounts }] as const,
}

export function useLabels(options?: { with_counts?: boolean }) {
  return useQuery({
    queryKey: labelKeys.list(options?.with_counts),
    queryFn: () => LabelAPI.list({ with_counts: options?.with_counts }),
    staleTime: 60 * 1000,
  })
}

export function useCreateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLabelRequest) => LabelAPI.create(body),
    onSuccess: (created, variables) => {
      if (typeof created.id !== "number") {
        queryClient.invalidateQueries({ queryKey: labelKeys.all })
        return
      }
      const row: DashboardLabel = {
        id: created.id,
        name: created.name ?? variables.name,
        color: created.color ?? variables.color ?? "#6B7280",
        complaint_count: created.complaint_count ?? 0,
      }
      queryClient.setQueriesData<DashboardLabel[]>(
        { queryKey: labelKeys.all },
        (old) => (old ? [...old, row] : [row]),
      )
      queryClient.setQueryData<ComplaintsAggregates | undefined>(
        complaintAggregatesKey,
        (agg) => mergeCreatedLabelIntoAggregates(agg, row),
      )
    },
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateLabelRequest }) =>
      LabelAPI.update(id, body),
    onSuccess: (updated, { id }) => {
      queryClient.setQueriesData<DashboardLabel[]>(
        { queryKey: labelKeys.all },
        (old) =>
          old?.map((l) => (l.id === id ? { ...l, ...updated } : l)) ?? old,
      )
      queryClient.setQueryData<ComplaintsAggregates | undefined>(
        complaintAggregatesKey,
        (agg) =>
          patchLabelInAggregates(agg, id, {
            name: updated.name,
            color: updated.color,
          }),
      )
      queryClient.setQueriesData<PaginatedData<Complaint>>(
        { queryKey: complaintKeys.lists() },
        (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.map((c) =>
              patchComplaintLabelsMeta(c, id, {
                name: updated.name,
                color: updated.color,
              }),
            ),
          }
        },
      )
      queryClient.setQueriesData<Complaint>(
        { queryKey: complaintKeys.details() },
        (old) =>
          old
            ? patchComplaintLabelsMeta(old, id, {
                name: updated.name,
                color: updated.color,
              })
            : old,
      )
    },
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => LabelAPI.delete(id),
    onSuccess: (_void, id) => {
      queryClient.setQueriesData<DashboardLabel[]>(
        { queryKey: labelKeys.all },
        (old) => old?.filter((l) => l.id !== id) ?? old,
      )
      queryClient.setQueryData<ComplaintsAggregates | undefined>(
        complaintAggregatesKey,
        (agg) => removeLabelFromAggregates(agg, id),
      )
      queryClient.setQueriesData<PaginatedData<Complaint>>(
        { queryKey: complaintKeys.lists() },
        (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.map((c) => stripLabelFromComplaint(c, id)),
          }
        },
      )
      queryClient.setQueriesData<Complaint>(
        { queryKey: complaintKeys.details() },
        (old) => (old ? stripLabelFromComplaint(old, id) : old),
      )
    },
  })
}
