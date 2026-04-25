import { api, apiRequest } from ".."
import { PlatformGroup } from "../../types/complaint.type"

type VkGroupRecord = {
  id: number
  is_monitoring?: boolean | number
  name: string
}

function mapVkGroup(record: VkGroupRecord): PlatformGroup {
  return {
    enabled: record.is_monitoring === true || record.is_monitoring === 1,
    id: record.id.toString(),
    name: record.name,
    platform: "vk",
  }
}

export const VkApi = {
  async createGroup(data: { url: string; name: string }): Promise<PlatformGroup> {
    const response = await apiRequest(
      api.post("vk/groups", { json: data }).json<VkGroupRecord>(),
    )
    return mapVkGroup(response)
  },

  async getGroups(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("vk/groups").json<VkGroupRecord[]>())
    return data.map(mapVkGroup)
  },

  async updateGroupStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`vk/groups/${id}/${action}`))
  },

  async deleteGroup(id: string): Promise<void> {
    await apiRequest(api.delete(`vk/groups/${id}`))
  },
}
