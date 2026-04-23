import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import type { Complaint, ComplaintsAggregates } from "@/lib/types/complaint.type"

export function stripLabelFromComplaint(
  c: Complaint,
  labelId: number,
): Complaint {
  return {
    ...c,
    labels: (c.labels ?? []).filter((l) => l.id !== labelId),
  }
}

export function patchComplaintLabelsMeta(
  c: Complaint,
  labelId: number,
  patch: { name?: string; color?: string },
): Complaint {
  return {
    ...c,
    labels: (c.labels ?? []).map((l) =>
      l.id === labelId ? { ...l, ...patch } : l,
    ),
  }
}

/** После PUT жалобы: скорректировать агрегаты по смене статуса и меток. */
export function patchAggregatesAfterComplaintUpdate(
  agg: ComplaintsAggregates | undefined,
  prev: Complaint,
  next: Complaint,
): ComplaintsAggregates | undefined {
  if (!agg) return agg

  const counts_by_status = { ...agg.counts_by_status }
  if (prev.status !== next.status) {
    counts_by_status[prev.status] = Math.max(
      0,
      (counts_by_status[prev.status] ?? 0) - 1,
    )
    counts_by_status[next.status] = (counts_by_status[next.status] ?? 0) + 1
  }

  const prevIds = new Set((prev.labels ?? []).map((l) => l.id))
  const nextIds = new Set((next.labels ?? []).map((l) => l.id))

  const counts_by_label = agg.counts_by_label.map((entry) => {
    let c = entry.complaint_count
    if (prevIds.has(entry.id) && !nextIds.has(entry.id)) {
      c = Math.max(0, c - 1)
    }
    if (!prevIds.has(entry.id) && nextIds.has(entry.id)) {
      c = c + 1
    }
    return { ...entry, complaint_count: c }
  })

  return { ...agg, counts_by_status, counts_by_label }
}

export function mergeCreatedLabelIntoAggregates(
  agg: ComplaintsAggregates | undefined,
  label: DashboardLabel,
): ComplaintsAggregates | undefined {
  if (!agg) return agg
  if (agg.counts_by_label.some((e) => e.id === label.id)) return agg
  return {
    ...agg,
    counts_by_label: [
      ...agg.counts_by_label,
      {
        id: label.id,
        name: label.name,
        color: label.color,
        complaint_count: label.complaint_count ?? 0,
      },
    ],
  }
}

export function removeLabelFromAggregates(
  agg: ComplaintsAggregates | undefined,
  labelId: number,
): ComplaintsAggregates | undefined {
  if (!agg) return agg
  return {
    ...agg,
    counts_by_label: agg.counts_by_label.filter((e) => e.id !== labelId),
  }
}

export function patchLabelInAggregates(
  agg: ComplaintsAggregates | undefined,
  labelId: number,
  patch: { name?: string; color?: string },
): ComplaintsAggregates | undefined {
  if (!agg) return agg
  return {
    ...agg,
    counts_by_label: agg.counts_by_label.map((e) =>
      e.id === labelId ? { ...e, ...patch } : e,
    ),
  }
}
