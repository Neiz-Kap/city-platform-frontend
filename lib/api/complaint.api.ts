import { api, apiRequest } from "."
import { PaginatedData } from "../types"
import {
  Complaint,
  ComplaintQueryParams,
  ComplaintsAggregates,
  ComplaintsByDatesParams,
  ComplaintStatusEntry,
  CreateComplaintRequest,
  UpdateComplaintRequest,
} from "../types/complaint.type"
import { normalizeComplaint, normalizeComplaintList } from "../utils/normalize-complaint"

import {
  StatItem,
  StatsQueryParams,
} from "@/lib/types/complaint-stats.type"

function complaintsSearchParams(
  params: ComplaintQueryParams,
): Record<string, string | number> {
  const searchParams: Record<string, string | number> = {}
  if (params.page != null) searchParams.page = params.page
  if (params.per_page != null) searchParams.per_page = params.per_page
  if (params.q) searchParams.q = params.q
  if (params.tags?.length) searchParams.tags = params.tags.join(",")
  if (params.status?.length) searchParams.status = params.status.join(",")
  if (params.label_ids?.length)
    searchParams.label_ids = params.label_ids.join(",")
  if (params.label_match) searchParams.label_match = params.label_match
  if (params.exclude_label_ids?.length)
    searchParams.exclude_label_ids = params.exclude_label_ids.join(",")
  if (params.sort_by) searchParams.sort_by = params.sort_by
  if (params.sort_order) searchParams.sort_order = params.sort_order
  return searchParams
}

function normalizePaginated(raw: PaginatedData<unknown>): PaginatedData<Complaint> {
  return {
    ...raw,
    data: normalizeComplaintList(raw.data),
  }
}

export class ComplaintAPI {
  private static prefix = "complaints"

  static async getAll(params: ComplaintQueryParams = {}) {
    const response = await apiRequest(
      api
        .get(this.prefix, { searchParams: complaintsSearchParams(params) })
        .json<PaginatedData<unknown>>(),
    )
    return normalizePaginated(response)
  }

  static async getByDateRange(params: ComplaintsByDatesParams) {
    const { start_date, end_date, ...rest } = params
    const response = await apiRequest(
      api
        .get(`${this.prefix}/by_dates`, {
          searchParams: { ...complaintsSearchParams(rest), start_date, end_date },
        })
        .json<PaginatedData<unknown> & { date_range?: unknown }>(),
    )
    return { ...normalizePaginated(response), date_range: response.date_range }
  }

  static getStatuses() {
    return apiRequest(api.get(`${this.prefix}/statuses`).json<ComplaintStatusEntry[]>())
  }

  static getAggregates() {
    return apiRequest(api.get(`${this.prefix}/aggregates`).json<ComplaintsAggregates>())
  }

  static async getById(id: string) {
    const response = await apiRequest(api.get(`${this.prefix}/${id}`).json<unknown>())
    return normalizeComplaint(response)
  }

  static async getBySource(sourcePlatform: "vk" | "email") {
    const response = await apiRequest(
      api
        .get(`${this.prefix}/source/${sourcePlatform}`)
        .json<{ source: string; count: number; complaints: unknown[] }>(),
    )
    return { ...response, complaints: normalizeComplaintList(response.complaints) }
  }

  static async create(complaintData: CreateComplaintRequest) {
    const raw = await apiRequest(
      api.post("complaint", { json: complaintData }).json<Record<string, unknown>>(),
    )
    if (typeof raw.id === "number" && raw.name == null) {
      return ComplaintAPI.getById(String(raw.id))
    }
    return normalizeComplaint(raw)
  }

  static update(id: string | number, body: UpdateComplaintRequest) {
    return apiRequest(api.put(`complaint/${id}`, { json: body }).json<unknown>())
  }

  static async updateLabels(id: string | number, label_ids: number[]) {
    const response = await apiRequest(
      api
        .put(`complaint/${id}/labels`, { json: { label_ids } })
        .json<{ message?: string; labels: Complaint["labels"] }>(),
    )
    return { ...response, labels: response.labels ?? [] }
  }

  static async delete(id: string) {
    await apiRequest(api.delete(`complaint/${id}`))
    return { success: true }
  }
}

export const ComplaintStatsApi = {
  async getStats(params: StatsQueryParams) {
    return apiRequest(
      api.post("complaints/statistics", { json: params }).json<PaginatedData<StatItem>>(),
    )
  },
}
