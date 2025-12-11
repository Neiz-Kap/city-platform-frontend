import { ExportableData } from "@/components/data-table/utils"

export enum Platform {
  VK = "vk",
  TELEGRAM = "telegram",
  EMAIL = "email",
}

export type SourcePlatform = `${Platform}`

// Types for complaints (adjust based on your actual API response)
export interface Complaint extends ExportableData{
  id: number
  name: string
  description: string
  category: string
  status: string
  url: string
  platform: SourcePlatform
  tags: string[]
  createdAt: string
  updatedAt: string

  is_deleted: 0 | 1
  departmentId: number
}

export interface PlatformGroup {
  id: string
  name: string
  enabled: boolean
  platform: SourcePlatform
}

export interface PlatformSource {
  platform: SourcePlatform
  label: string
  allEnabled: boolean
  groups: PlatformGroup[]
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

// SearchParamsOption
export type ComplaintQueryParams =  {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  // category?: string[]
  // status?: string[]
}

export type TCreateTelegram = {
  token: string
  name: string
}

export type TCreateVK = {
  url: string
  name: string
}
