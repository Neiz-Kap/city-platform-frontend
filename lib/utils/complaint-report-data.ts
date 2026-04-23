import { ComplaintAPI } from "@/lib/api/complaint.api"
import type { Complaint } from "@/lib/types/complaint.type"

export const REPORT_TABLE_LIMIT = 100

const REPORT_SORT = {
  sort_by: "createdAt",
  sort_order: "DESC" as const,
}

export type ReportPeriodAggregates = {
  total: number
  counts_by_status: Record<string, number>
  counts_by_platform: Record<string, number>
  /** label name -> count of complaints that have that label */
  label_counts: Record<string, number>
}

export type ReportFetchProgress = (info: { page: number; pages: number }) => void

function bump(rec: Record<string, number>, key: string) {
  rec[key] = (rec[key] ?? 0) + 1
}

function consumeComplaints(
  list: Complaint[],
  counts_by_status: Record<string, number>,
  counts_by_platform: Record<string, number>,
  label_counts: Record<string, number>,
) {
  for (const c of list) {
    bump(counts_by_status, c.status)
    bump(counts_by_platform, c.platform)
    for (const l of c.labels ?? []) {
      bump(label_counts, l.name)
    }
  }
}

/**
 * Loads complaints in the date range: first page (up to 100) for the PDF table,
 * then remaining pages only to aggregate KPIs (status / platform / labels).
 */
export async function fetchComplaintsReportData(
  params: { start_date: string; end_date: string },
  onProgress?: ReportFetchProgress,
): Promise<{
  tableRows: Complaint[]
  total: number
  aggregates: ReportPeriodAggregates
}> {
  const first = await ComplaintAPI.getByDateRange({
    ...params,
    ...REPORT_SORT,
    page: 1,
    per_page: REPORT_TABLE_LIMIT,
  })

  const total = first.pagination.total
  const pages = Math.max(1, first.pagination.pages)
  onProgress?.({ page: 1, pages })

  const counts_by_status: Record<string, number> = {}
  const counts_by_platform: Record<string, number> = {}
  const label_counts: Record<string, number> = {}

  consumeComplaints(
    first.data,
    counts_by_status,
    counts_by_platform,
    label_counts,
  )

  for (let page = 2; page <= pages; page++) {
    onProgress?.({ page, pages })
    const res = await ComplaintAPI.getByDateRange({
      ...params,
      ...REPORT_SORT,
      page,
      per_page: REPORT_TABLE_LIMIT,
    })
    consumeComplaints(
      res.data,
      counts_by_status,
      counts_by_platform,
      label_counts,
    )
  }

  return {
    tableRows: first.data,
    total,
    aggregates: {
      total,
      counts_by_status,
      counts_by_platform,
      label_counts,
    },
  }
}
