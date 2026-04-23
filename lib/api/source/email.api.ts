import { api, apiRequest } from ".."
import { PlatformGroup } from "../../types/complaint.type"

export const EmailApi = {
  async createParser(data: { name: string }): Promise<PlatformGroup> {
    const response = await apiRequest(
      api
        .post("monitoring/email", { json: data })
        .json<{ id: number; is_active: boolean; name: string }>(),
    )
    return {
      enabled: response.is_active,
      id: response.id.toString(),
      name: response.name,
      platform: "email",
    }
  },

  async getParsers(): Promise<PlatformGroup[]> {
    const data = await apiRequest(
      api
        .get("monitoring/email")
        .json<{ id: number; is_active: boolean; name: string }[]>(),
    )
    return data.map((parser) => ({
      enabled: parser.is_active,
      id: parser.id.toString(),
      name: parser.name,
      platform: "email",
    }))
  },

  async updateParserStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`monitoring/email/${id}/${action}`))
  },

  async deleteParser(id: string): Promise<void> {
    await apiRequest(api.delete(`monitoring/email/${id}`))
  },
}
