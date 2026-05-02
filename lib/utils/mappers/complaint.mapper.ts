import { z } from "zod"

import type {
  Complaint,
  CreateComplaintRequest,
  UpdateComplaintRequest,
} from "@/lib/types/complaint.type"
import { BaseMapper } from "./base.mapper"

// Zod schemas for strict backend validation
const LabelBackendSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  user_id: z.number(),
  complaint_count: z.number().optional(),
})

const ComplaintBackendSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  source_url: z.string().optional(),
  source_id: z.number().optional(),
  platform: z.string(),
  user_id: z.number(),
  department_id: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  labels: z.array(LabelBackendSchema).optional(),
})

// Type inferred from schema
type ComplaintBackend = z.infer<typeof ComplaintBackendSchema>

/**
 * Mapper for Complaint entity with Zod validation
 */
export class ComplaintMapper extends BaseMapper<
  Complaint,
  CreateComplaintRequest,
  ComplaintBackend
> {
  protected readonly backendSchema = ComplaintBackendSchema

  protected parseToDomain(data: ComplaintBackend): Complaint {
    const sourceUrl = data.source_url ?? ""

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      url: sourceUrl,
      source_url: sourceUrl,
      platform: data.platform as Complaint["platform"],
      userId: data.user_id,
      departmentId: data.department_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      labels: data.labels?.map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
        userId: label.user_id,
        complaint_count: label.complaint_count,
      })),
    }
  }

  toResponse(frontend: CreateComplaintRequest): Record<string, unknown> {
    return {
      name: frontend.name,
      description: frontend.description,
      status: frontend.status,
      source_platform: frontend.source_platform,
      source_url: frontend.source_url,
      label_ids: frontend.label_ids,
    }
  }

  /**
   * Convert frontend update request to backend format (snake_case)
   */
  updateToResponse(frontend: UpdateComplaintRequest): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (frontend.name !== undefined) result.name = frontend.name
    if (frontend.description !== undefined)
      result.description = frontend.description
    if (frontend.status !== undefined) result.status = frontend.status
    if (frontend.departmentId !== undefined)
      result.department_id = frontend.departmentId
    if (frontend.label_ids !== undefined) result.label_ids = frontend.label_ids
    return result
  }
}

// Singleton instance for convenient usage
export const complaintMapper = new ComplaintMapper()
