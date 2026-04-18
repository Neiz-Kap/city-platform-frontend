import { ExportableData } from "@/components/data-table/utils"

import type { DashboardLabel } from "./complaint-label.type"

/** Подключаемые источники мониторинга (VK, email). Telegram с бэкенда снят. */
export enum Platform {
  VK = "vk",
  EMAIL = "email",
}

export type SourcePlatform = `${Platform}`

/** Значение `platform` из API (в БД могут остаться старые `telegram_bot`). */
export type ComplaintPlatform = SourcePlatform | "telegram_bot"

// Types for complaints (adjust based on your actual API response)
export interface Complaint extends ExportableData {
  id: number
  name: string
  description: string
  category: string
  status: string
  /** Ссылка на пост/источник; бэкенд может отдавать `source_url`. */
  url?: string
  source_url?: string
  platform: ComplaintPlatform
  tags: string[]
  labels?: DashboardLabel[]
  createdAt: string
  updatedAt: string

  is_deleted?: 0 | 1
  departmentId?: number
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
  status?: string
  source_platform: string
  source_url?: string
  tags?: string[]
  label_ids?: number[]
}

/** PATCH-подобное обновление жалобы (PUT /complaint/:id). */
export interface UpdateComplaintRequest {
  name?: string
  description?: string
  category?: string
  status?: string
  departmentId?: number
  label_ids?: number[]
}

export type LabelMatchMode = "any" | "all"

// GET /complaints query (контракт бэкенда)
export type ComplaintQueryParams = {
  page?: number
  per_page?: number
  q?: string
  tags?: string[]
  /** CSV: backlog,in_progress,done */
  status?: string[]
  label_ids?: number[]
  label_match?: LabelMatchMode
  exclude_label_ids?: number[]
  sort_by?: string
  sort_order?: "ASC" | "DESC"
}

/** GET /complaints/by_dates */
export type ComplaintsByDatesParams = ComplaintQueryParams & {
  start_date: string
  end_date: string
}

export type ComplaintStatusEntry = { key: string; label_ru: string }

export type ComplaintsAggregates = {
  counts_by_status: Record<string, number>
  counts_by_label: Array<{
    id: number
    name: string
    color: string
    complaint_count: number
  }>
}

export type TCreateVK = {
  url: string
  name: string
}
