import { SourceMapper } from "@/lib/utils/mappers/source.mapper"

import { api, apiRequest } from ".."
import { EmailMonitoringConfig, PlatformGroup } from "../../types/complaint.type"

export const EmailApi = {
  async createParser(data: EmailMonitoringConfig): Promise<PlatformGroup> {
    const response = await apiRequest(
      api
        .post("api/v1/monitoring/email", { json: SourceMapper.emailConfigToResponse(data) })
        .json<unknown>(),
    )
    return SourceMapper.emailMonitoringToDomain(response)
  },

  async getParsers(): Promise<PlatformGroup[]> {
    const data = await apiRequest(api.get("api/v1/monitoring/email").json<unknown[]>())
    return SourceMapper.emailMonitoringToDomainMany(data)
  },

  async updateParserStatus(id: string, action: "start" | "stop"): Promise<void> {
    await apiRequest(api.post(`api/v1/monitoring/email/${id}/${action}`))
  },

  async deleteParser(id: string): Promise<void> {
    await apiRequest(api.delete(`api/v1/monitoring/email/${id}`))
  },
}
