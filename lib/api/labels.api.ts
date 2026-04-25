import { api, apiRequest } from "."
import type {
  CreateLabelRequest,
  DashboardLabel,
  UpdateLabelRequest,
} from "@/lib/types/complaint-label.type"

const MAX_LABELS_PER_ACCOUNT = 10

type LabelMutationResponse = Partial<DashboardLabel> & {
  id?: number
  message?: string
}

export { MAX_LABELS_PER_ACCOUNT }

export class LabelAPI {
  private static prefix = "labels"

  static async list(options?: { with_counts?: boolean }) {
    const searchParams: Record<string, string> = {}
    if (options?.with_counts) searchParams.with_counts = "1"

    return apiRequest(
      api.get(this.prefix, { searchParams }).json<DashboardLabel[]>(),
    )
  }

  static async create(body: CreateLabelRequest) {
    return apiRequest(api.post(this.prefix, { json: body }).json<LabelMutationResponse>())
  }

  static async update(id: number, body: UpdateLabelRequest) {
    return apiRequest(
      api.put(`${this.prefix}/${id}`, { json: body }).json<LabelMutationResponse>(),
    )
  }

  static async delete(id: number) {
    await apiRequest(api.delete(`${this.prefix}/${id}`))
  }
}
