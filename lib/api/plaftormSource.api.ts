import { api } from "."
import {
  PlatformGroup,
  PlatformSource,
  SourcePlatform,
} from "../types/complaint.type"

export class SourceService {
  // --- VK Groups ---
  static async getVkGroups(): Promise<PlatformGroup[]> {
    const data = await api
      .get("vk/groups")
      .json<{ id: number; name: string; is_monitoring: boolean }[]>()
    return data.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      enabled: g.is_monitoring,
      platform: "vk",
    }))
  }

  static async updateVkGroupStatus(
    id: string,
    action: "start" | "stop",
  ): Promise<void> {
    await api.post(`vk/groups/${id}/${action}`)
  }

  static async deleteVkGroup(id: string): Promise<void> {
    await api.delete(`vk/groups/${id}`)
  }

  // --- Telegram Bots ---
  static async getTelegramBots(): Promise<PlatformGroup[]> {
    const data = await api
      .get("telegram/bots")
      .json<{ token: string; title: string; is_running: boolean }[]>()
    return data.map((b) => ({
      id: b.token,
      name: b.title,
      enabled: b.is_running,
      platform: "telegram",
    }))
  }

  static async updateTelegramBotStatus(
    token: string,
    action: "start" | "stop",
  ): Promise<void> {
    await api.post(`telegram/bots/${token}/${action}`)
  }

  static async deleteTelegramBot(token: string): Promise<void> {
    await api.delete(`telegram/bots/${token}`)
  }

  // --- Email Monitoring ---
  static async getEmailParsers(): Promise<PlatformGroup[]> {
    const data = await api
      .get("monitoring/email")
      .json<{ id: number; name: string; is_monitoring: boolean }[]>()
    return data.map((e) => ({
      id: e.id.toString(),
      name: e.name,
      enabled: e.is_monitoring,
      platform: "email",
    }))
  }

  static async updateEmailParserStatus(
    id: string,
    action: "start" | "stop",
  ): Promise<void> {
    await api.post(`monitoring/email/${id}/${action}`)
  }

  static async deleteEmailParser(id: string): Promise<void> {
    await api.delete(`monitoring/email/${id}`)
  }

  // --- Unified Methods ---
  static async getAllSources(): Promise<PlatformSource[]> {
    const [vkGroups, tgBots, emailParsers] = await Promise.all([
      this.getVkGroups().catch(() => [] as PlatformGroup[]),
      this.getTelegramBots().catch(() => [] as PlatformGroup[]),
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
        platform: "telegram",
        label: "Telegram Боты",
        allEnabled: tgBots.length > 0 && tgBots.every((g) => g.enabled),
        groups: tgBots,
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
      case "telegram":
        return this.updateTelegramBotStatus(id, action)
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
      case "telegram":
        return this.deleteTelegramBot(id)
      case "email":
        return this.deleteEmailParser(id)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}
