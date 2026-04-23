import type { ComplaintPlatform } from "@/lib/types/complaint.type"

const PLATFORM_LABEL_RU: Record<string, string> = {
  vk: "ВКонтакте",
  email: "Электронная почта",
  telegram_bot: "Telegram",
}

export function complaintPlatformLabelRu(platform: ComplaintPlatform): string {
  return PLATFORM_LABEL_RU[platform] ?? platform
}
