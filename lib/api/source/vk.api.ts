import { api, apiRequest } from ".."
import { PlatformGroup } from "../../types/complaint.type"
import { SourceMapper } from "@/lib/utils/mappers/source.mapper"

export const VkApi = {
  async createGroup(data: { url: string; name: string }): Promise<PlatformGroup> {
    const response = await apiRequest(
      api.post("vk/groups", { json: SourceMapper.vkGroupToResponse(data) }).json<unknown>(),
    )
    return SourceMapper.vkGroupToDomain(response)
  },

  async getGroups(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("vk/groups").json<unknown[]>())
    return SourceMapper.vkGroupToDomainMany(data)
  },

  async updateGroupStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`vk/groups/${id}/${action}`))
  },

  async deleteGroup(id: string): Promise<void> {
    await apiRequest(api.delete(`vk/groups/${id}`))
  },
}
