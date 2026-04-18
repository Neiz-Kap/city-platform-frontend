import { api } from "."
import type {
  CreateLabelRequest,
  DashboardLabel,
  UpdateLabelRequest,
} from "@/lib/types/complaint-label.type"

const MAX_LABELS_PER_ACCOUNT = 10

export { MAX_LABELS_PER_ACCOUNT }

export class LabelAPI {
  private static prefix = "labels"

  static async list(options?: { with_counts?: boolean }) {
    const searchParams: Record<string, string> = {}
    if (options?.with_counts) searchParams.with_counts = "1"

    const response = await api
      .get(this.prefix, { searchParams })
      .json<DashboardLabel[]>()
    return response
  }

  static async create(body: CreateLabelRequest) {
    const response = await api
      .post(this.prefix, { json: body })
      .json<DashboardLabel>()
    return response
  }

  static async update(id: number, body: UpdateLabelRequest) {
    const response = await api
      .put(`${this.prefix}/${id}`, { json: body })
      .json<DashboardLabel>()
    return response
  }

  static async delete(id: number) {
    await api.delete(`${this.prefix}/${id}`)
  }
}
