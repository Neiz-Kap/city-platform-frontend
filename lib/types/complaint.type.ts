import { SearchParamsOption } from "ky"

export enum Platform {
  VK = "vk",
}

// Types for complaints (adjust based on your actual API response)
export interface Complaint {
  id: number
  name: string
  description: string
  category: string
  status: string
  url: string
  platform: `${Platform}`
  tags: string[]
  createdAt: string
  updatedAt: string

  is_deleted: 0 | 1
  departmentId: number | null
}

export interface CreateComplaintRequest {
  name: string
  description: string
  category: string
  status: string
  source_platform: string
  source_url?: string
  tags?: string[]
}

export type ComplaintQueryParams = SearchParamsOption & {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  category?: string[]
  status?: string[]
}
