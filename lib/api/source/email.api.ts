import { api, apiRequest } from ".."
import {
  EmailMonitoringConfig,
  PlatformGroup,
} from "../../types/complaint.type"

type EmailMonitoringRecord = {
  id: number
  is_active?: boolean | number
  is_monitoring?: boolean | number
  is_running?: boolean | number
  name: string
}

function isEnabled(value: boolean | number | undefined) {
  return value === true || value === 1
}

function mapEmailSource(record: EmailMonitoringRecord): PlatformGroup {
  return {
    enabled: isEnabled(
      record.is_running ?? record.is_monitoring ?? record.is_active,
    ),
    id: record.id.toString(),
    name: record.name,
    platform: "email",
  }
}

export const EmailApi = {
  async createParser(data: EmailMonitoringConfig): Promise<PlatformGroup> {
    const response = await apiRequest(
      api.post("monitoring/email", { json: data }).json<EmailMonitoringRecord>(),
    )
    return mapEmailSource(response)
  },

  async getParsers(): Promise<PlatformGroup[]> {
    const data = await apiRequest(
      api.get("monitoring/email").json<EmailMonitoringRecord[]>(),
    )
    return data.map(mapEmailSource)
  },

  async updateParserStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`monitoring/email/${id}/${action}`))
  },

  async deleteParser(id: string): Promise<void> {
    await apiRequest(api.delete(`monitoring/email/${id}`))
  },
}
