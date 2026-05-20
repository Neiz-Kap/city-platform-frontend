import type {
  CreateLabelRequest,
  DashboardLabel,
  UpdateLabelRequest,
} from "@/lib/types/complaint-label.type"
import { labelMapper } from "@/lib/utils/mappers/label.mapper"

import { api, apiRequest } from "."

const MAX_LABELS_PER_ACCOUNT = 10

export { MAX_LABELS_PER_ACCOUNT }

export class LabelAPI {
  private static prefix = "api/v1/labels"

  static async list(options?: { with_counts?: boolean }) {
    const searchParams: Record<string, string> = {}
    if (options?.with_counts) searchParams.with_counts = "1"

    const response = await apiRequest(api.get(this.prefix, { searchParams }).json<unknown[]>())
    return labelMapper.toDomainMany(response)
  }

  static async create(body: CreateLabelRequest) {
    const response = await apiRequest(
      api.post(this.prefix, { json: labelMapper.toResponse(body) }).json<unknown>(),
    )
    return labelMapper.toDomain(response)
  }

  static async update(id: number, body: UpdateLabelRequest) {
    const response = await apiRequest(
      api.put(`${this.prefix}/${id}`, { json: labelMapper.updateToResponse(body) }).json<unknown>(),
    )
    return labelMapper.toDomain(response)
  }

  static async delete(id: number) {
    await apiRequest(api.delete(`${this.prefix}/${id}`))
  }
}
