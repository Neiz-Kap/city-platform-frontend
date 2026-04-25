import { api, apiRequest } from "."
import {
  PlatformGroup,
  PlatformSource,
  SourcePlatform,
} from "../types/complaint.type"

type VkGroupRecord = {
  id: number
  is_monitoring?: boolean | number
  name: string
}

type EmailSourceRecord = {
  id: number
  is_active?: boolean | number
  is_monitoring?: boolean | number
  is_running?: boolean | number
  name: string
}

function isEnabled(value: boolean | number | undefined) {
  return value === true || value === 1
}

export class SourceService {
  // --- VK Groups ---
  static async getVkGroups(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("vk/groups").json<VkGroupRecord[]>())
    return data.map((group) => ({
      id: group.id.toString(),
      name: group.name,
      enabled: isEnabled(group.is_monitoring),
      platform: "vk",
    }))
  }

  static async updateVkGroupStatus(
    id: string,
    action: "start" | "stop",
  ): Promise<void> {
    await apiRequest(api.post(`vk/groups/${id}/${action}`))
  }

  static async deleteVkGroup(id: string): Promise<void> {
    await apiRequest(api.delete(`vk/groups/${id}`))
  }

  // --- Email Monitoring ---
  static async getEmailParsers(): Promise<PlatformGroup[]> {
    const data = await apiRequest(
      api.get("monitoring/email").json<EmailSourceRecord[]>(),
    )
    return data.map((source) => ({
      id: source.id.toString(),
      name: source.name,
      enabled: isEnabled(
        source.is_running ?? source.is_monitoring ?? source.is_active,
      ),
      platform: "email",
    }))
  }

  static async updateEmailParserStatus(
    id: string,
    action: "start" | "stop",
  ): Promise<void> {
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
        allEnabled:
          emailParsers.length > 0 && emailParsers.every((g) => g.enabled),
        groups: emailParsers,
      },
    ]
  }

  static async updateGroupStatus(
    platform: SourcePlatform,
    id: string,
    enabled: boolean,
  ) {
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
