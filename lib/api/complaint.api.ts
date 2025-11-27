import { api } from "."
import { PaginatedData } from "../types"
import {
  Complaint,
  ComplaintQueryParams,
  CreateComplaintRequest,
} from "../types/complaint.type"

/** @class Complaint API to interact with backend */
export class ComplaintAPI {
  private static prefix = "complaints"

  static async getAll(params: ComplaintQueryParams = {}) {
    try {
      const searchParams = new URLSearchParams()

      // Add pagination params
      if (params.page) searchParams.append("page", params.page.toString())
      if (params.per_page)
        searchParams.append("per_page", params.per_page.toString())
      if (params.search) searchParams.append("search", params.search)
      if (params.sort) searchParams.append("sort", params.sort)

      // Add array params
      if (params.category?.length) {
        params.category.forEach((cat) => searchParams.append("category", cat))
      }
      if (params.status?.length) {
        params.status.forEach((status) => searchParams.append("status", status))
      }

      const response = await api
        .get(this.prefix, {
          searchParams: params,
        })
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
