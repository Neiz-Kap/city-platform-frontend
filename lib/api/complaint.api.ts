import { api } from "."
import { PaginatedData } from "../types"
import {
  Complaint,
  ComplaintQueryParams,
  CreateComplaintRequest,
} from "../types/complaint.type"

import {
  StatItem,
  StatsQueryParams
} from "@/lib/types/complaint-stats.type"

/** @class Complaint API to interact with backend */
export class ComplaintAPI {
  private static prefix = "complaints"

  static async getAll(params: ComplaintQueryParams = {}) {
    try {
      const searchParams: Record<string, string | number> = {}
      if (params.page != null) searchParams.page = params.page
      if (params.per_page != null) searchParams.per_page = params.per_page
      if (params.q) searchParams.q = params.q
      if (params.tags?.length) searchParams.tags = params.tags.join(",")
      if (params.sort_by) searchParams.sort_by = params.sort_by
      if (params.sort_order) searchParams.sort_order = params.sort_order

      const response = await api
        .get(this.prefix, { searchParams })
        .json<PaginatedData<Complaint>>()
      return response
    } catch (error) {
      console.error("Error when retrieving complaints: ", error)
      throw error
    }
  }

  static async getById(id: string) {
    try {
      const response = await api.get(`${this.prefix}/${id}`).json<Complaint>()
      return response
    } catch (error) {
      console.error("Error when retrieving complaint: ", error)
      throw error
    }
  }

  /** GET /complaints/source/{vk|email}. Путь `telegram_bot` на бэкенде даёт 400. */
  static async getBySource(sourcePlatform: "vk" | "email") {
    try {
      const response = await api
        .get(`${this.prefix}/source/${sourcePlatform}`)
        .json<{
          source: string
          count: number
          complaints: Complaint[]
        }>()
      return response
    } catch (error) {
      console.error("Error when retrieving complaints by source: ", error)
      throw error
    }
  }

  static async create(complaintData: CreateComplaintRequest) {
    try {
      const response = await api
        .post("complaint", {
          json: complaintData,
        })
        .json<Complaint>()
      return response
    } catch (error) {
      console.error("Error when creating complaint: ", error)
      throw error
    }
  }

  static async delete(id: string) {
    try {
      await api.delete(`complaint/${id}`)
      return { success: true }
    } catch (error) {
      console.error("Error when deleting complaint: ", error)
      throw error
    }
  }
}

export const ComplaintStatsApi = {
  async getStats(params: StatsQueryParams) {
    const response = await api
      .post("complaints/statistics", { json: params })
      .json<PaginatedData<StatItem>>()

      return response;
  },
}
