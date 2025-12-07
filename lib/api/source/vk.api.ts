// lib/api/source/vk.api.ts
import { api } from "..";
import { PlatformGroup } from "../../types/complaint.type";

export const VkApi = {
  async createGroup(data: { url: string; name: string }): Promise<PlatformGroup> {
    const response = await api.post("vk/groups", { json: data }).json<{
      id: number
      name: string
      is_monitoring: boolean
    }>()
    return {
      id: response.id.toString(),
      name: response.name,
      enabled: response.is_monitoring,
      platform: "vk",
    }
  },

  async getGroups(): Promise<PlatformGroup[]> {
    const data = await api
      .get("vk/groups")
      .json<{ id: number; name: string; is_monitoring: boolean }[]>()
    return data.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      enabled: g.is_monitoring,
      platform: "vk",
    }))
  },

  async updateGroupStatus(id: string, action: "start" | "stop"): Promise<void> {
    await api.post(`vk/groups/${id}/${action}`)
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`vk/groups/${id}`)
  },
}
