import type { Complaint, ComplaintPlatform } from "@/lib/types/complaint.type"

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function numberOrUndefined(value: unknown) {
  return typeof value === "number" ? value : undefined
}

/** Приводит сырой ответ API к единому виду `Complaint`. */
export function normalizeComplaint(raw: unknown): Complaint {
  const r = raw as Record<string, unknown> & Partial<Complaint>
  const sourceUrl =
    stringOrUndefined(r.source_url) ??
    stringOrUndefined(r.url) ??
    undefined

  return {
    ...r,
    createdAt:
      stringOrUndefined(r.createdAt) ??
      stringOrUndefined(r.created_at) ??
      "",
    departmentId:
      numberOrUndefined(r.departmentId) ?? numberOrUndefined(r.department_id),
    description: stringOrUndefined(r.description) ?? "",
    id: typeof r.id === "number" ? r.id : Number(r.id ?? 0),
    labels: Array.isArray(r.labels) ? r.labels : [],
    name: stringOrUndefined(r.name) ?? "",
    platform:
      (stringOrUndefined(r.platform) ??
        stringOrUndefined(r.source_platform) ??
        "vk") as ComplaintPlatform,
    source_url: sourceUrl,
    status: stringOrUndefined(r.status) ?? "backlog",
    updatedAt:
      stringOrUndefined(r.updatedAt) ??
      stringOrUndefined(r.updated_at) ??
      "",
    url: sourceUrl,
  }
}

export function normalizeComplaintList(raw: unknown[]): Complaint[] {
  return raw.map((item) => normalizeComplaint(item))
}
