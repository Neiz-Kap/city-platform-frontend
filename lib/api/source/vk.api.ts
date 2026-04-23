import { api, apiRequest } from ".."
import { PlatformGroup } from "../../types/complaint.type"

export const VkApi = {
  async createGroup(data: { url: string; name: string }): Promise<PlatformGroup> {
    const response = await apiRequest(
      api.post("vk/groups", { json: data }).json<{
        id: number
        is_monitoring: boolean
        name: string
      }>(),
    )
    return {
      enabled: response.is_monitoring,
      id: response.id.toString(),
      name: response.name,
      platform: "vk",
    }
  },

  async getGroups(): Promise<PlatformGroup[]> {
    const data = await apiRequest(
      api
        .get("vk/groups")
        .json<{ id: number; is_monitoring: boolean; name: string }[]>(),
    )
    return data.map((group) => ({
      enabled: group.is_monitoring,
      id: group.id.toString(),
      name: group.name,
      platform: "vk",
    }))
  },

  async updateGroupStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`vk/groups/${id}/${action}`))
  },

  async deleteGroup(id: string): Promise<void> {
    await apiRequest(api.delete(`vk/groups/${id}`))
  },
}
