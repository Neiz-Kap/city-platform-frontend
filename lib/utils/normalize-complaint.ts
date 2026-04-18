import type { Complaint } from "@/lib/types/complaint.type"

/** Приводит сырой ответ API к единому виду `Complaint`. */
export function normalizeComplaint(raw: unknown): Complaint {
  const r = raw as Record<string, unknown> & Complaint
  const url =
    (typeof r.url === "string" && r.url) ||
    (typeof r.source_url === "string" ? r.source_url : "") ||
    undefined

  return {
    ...r,
    url: url ?? r.url,
    labels: Array.isArray(r.labels) ? r.labels : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
  }
}

export function normalizeComplaintList(raw: unknown[]): Complaint[] {
  return raw.map((item) => normalizeComplaint(item))
}
