import { SourceMapper } from "@/lib/utils/mappers/source.mapper"

import { api, apiRequest } from "."
import { PlatformGroup, PlatformSource, SourcePlatform } from "../types/complaint.type"

export class SourceService {
  // --- VK Groups ---
  static async getVkGroups(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("vk/groups").json<unknown[]>())
    return SourceMapper.vkGroupListToDomain(data)
  }

  static async updateVkGroupStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`vk/groups/${id}/${action}`))
  }

  static async deleteVkGroup(id: string): Promise<void> {
    await apiRequest(api.delete(`vk/groups/${id}`))
  }

  // --- Email Monitoring ---
  static async getEmailParsers(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("monitoring/email").json<unknown[]>())
    return SourceMapper.emailMonitoringToDomainMany(data)
  }

  static async updateEmailParserStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`monitoring/email/${id}/${action}`))
  }

  static async deleteEmailParser(id: string): Promise<void> {
    await apiRequest(api.delete(`monitoring/email/${id}`))
  }

  // --- Unified Methods ---
  static async getAllSources(): Promise<PlatformSource[]> {
    const [vkGroups, emailParsers] = await Promise.all([
      this.getVkGroups().catch(() => [] as PlatformGroup[]),
      this.getEmailParsers().catch(() => [] as PlatformGroup[]),
    ])

    return [
      {
        platform: "vk",
        label: "ВКонтакте",
        allEnabled: vkGroups.length > 0 && vkGroups.every((g) => g.enabled),
        groups: vkGroups,
      },
      {
        platform: "email",
        label: "Почта",
        allEnabled: emailParsers.length > 0 && emailParsers.every((g) => g.enabled),
        groups: emailParsers,
      },
    ]
  }

  static async updateGroupStatus(platform: SourcePlatform, id: string, enabled: boolean) {
    const action = enabled ? "start" : "stop"
    switch (platform) {
      case "vk":
        return this.updateVkGroupStatus(id, action)
      case "email":
        return this.updateEmailParserStatus(id, action)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  static async deleteGroup(platform: SourcePlatform, id: string) {
    switch (platform) {
      case "vk":
        return this.deleteVkGroup(id)
      case "email":
        return this.deleteEmailParser(id)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}
