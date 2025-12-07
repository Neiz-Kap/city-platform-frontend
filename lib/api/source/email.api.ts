// lib/api/source/email.api.ts
import { api } from "..";
import { PlatformGroup } from "../../types/complaint.type";

export const EmailApi = {
  async createParser(data: { name: string }): Promise<PlatformGroup> {
    const response = await api
      .post("monitoring/email", { json: data })
      .json<{ id: number; name: string; is_active: boolean }>()
    return {
      id: response.id.toString(),
      name: response.name,
      enabled: response.is_active,
      platform: "email",
    }
  },

  async getParsers(): Promise<PlatformGroup[]> {
    const data = await api
      .get("monitoring/email")
      .json<{ id: number; name: string; is_active: boolean }[]>()
    return data.map((e) => ({
      id: e.id.toString(),
      name: e.name,
      enabled: e.is_active,
      platform: "email",
    }))
  },

  async updateParserStatus(id: string, action: "start" | "stop"): Promise<void> {
    await api.post(`monitoring/email/${id}/${action}`)
  },

  async deleteParser(id: string): Promise<void> {
    await api.delete(`monitoring/email/${id}`)
  },
}
