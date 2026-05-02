import { z } from "zod"

import type {
  CreateLabelRequest,
  DashboardLabel,
  UpdateLabelRequest,
} from "@/lib/types/complaint-label.type"
import { BaseMapper } from "./base.mapper"

// Zod schema for strict backend validation
const LabelBackendSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  user_id: z.number(),
  complaint_count: z.number().optional(),
})

// Type inferred from schema
type LabelBackend = z.infer<typeof LabelBackendSchema>

/**
 * Mapper for Label entity with Zod validation
 */
export class LabelMapper extends BaseMapper<
  DashboardLabel,
  CreateLabelRequest,
  LabelBackend
> {
  protected readonly backendSchema = LabelBackendSchema

  protected parseToDomain(data: LabelBackend): DashboardLabel {
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      userId: data.user_id,
      complaint_count: data.complaint_count,
    }
  }

  toResponse(frontend: CreateLabelRequest): Record<string, unknown> {
    return {
      name: frontend.name,
      color: frontend.color,
    }
  }

  /**
   * Convert frontend update request to backend format (snake_case)
   */
  updateToResponse(frontend: UpdateLabelRequest): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (frontend.name !== undefined) result.name = frontend.name
    if (frontend.color !== undefined) result.color = frontend.color
    return result
  }
}

// Singleton instance for convenient usage
export const labelMapper = new LabelMapper()
