// lib/api/source/telegram.api.ts
import { api } from ".."
import { PlatformGroup } from "../../types/complaint.type"

export const TelegramApi = {
  async createBot(data: {
    token: string
    name: string
  }): Promise<PlatformGroup> {
    const response = await api.post("telegram/bots", { json: data }).json<{
      token: string
      title: string
      is_running: boolean
    }>()
    return {
      id: response.token,
      name: response.title,
      enabled: response.is_running,
      platform: "telegram",
    }
  },

  async getBots(): Promise<PlatformGroup[]> {
    const data = await api
      .get("telegram/bots")
      .json<{ token: string; title: string; is_running: boolean }[]>()
    return data.map((b) => ({
      id: b.token,
      name: b.title,
      enabled: b.is_running,
      platform: "telegram",
    }))
  },

  async updateBotStatus(
    token: string,
    action: "start" | "stop",
  ): Promise<void> {
    await api.post(`telegram/bots/${token}/${action}`)
  },

  async deleteBot(token: string): Promise<void> {
    await api.delete(`telegram/bots/${token}`)
  },
}
