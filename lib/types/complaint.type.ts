import { ExportableData } from "@/components/data-table/utils"

/** Подключаемые источники мониторинга (VK, email). Telegram с бэкенда снят. */
export enum Platform {
  VK = "vk",
  EMAIL = "email",
}

export type SourcePlatform = `${Platform}`

/** Значение `platform` из API (в БД могут остаться старые `telegram_bot`). */
export type ComplaintPlatform = SourcePlatform | "telegram_bot"

// Types for complaints (adjust based on your actual API response)
export interface Complaint extends ExportableData{
  id: number
  name: string
  description: string
  category: string
  status: string
  url: string
  platform: ComplaintPlatform
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

// GET /complaints query (контракт бэкенда)
export type ComplaintQueryParams = {
  page?: number
  per_page?: number
  q?: string
  tags?: string[]
  sort_by?: string
  sort_order?: "ASC" | "DESC"
}

export type TCreateVK = {
  url: string
  name: string
}
