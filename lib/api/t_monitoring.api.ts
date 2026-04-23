import { api, apiRequest } from "."

export class MonitoringAPI {
  static startVKMonitoring() {
    return apiRequest(api.post("monitoring/vk/start").json<unknown>())
  }

  static stopVKMonitoring() {
    return apiRequest(api.post("monitoring/vk/stop").json<unknown>())
  }

  static getVKMonitoringStatus() {
    return apiRequest(api.get("monitoring/vk/status").json<unknown>())
  }

  static createEmailMonitoring(config: {
    check_interval: number
    email: string
    folder: string
    imap_port: number
    imap_server: string
    name: string
    password: string
    use_ssl: boolean
  }) {
    return apiRequest(
      api
        .post("monitoring/email", {
          json: config,
        })
        .json<unknown>(),
    )
  }

  static startEmailMonitoring(id: string) {
    return apiRequest(api.post(`monitoring/email/${id}/start`).json<unknown>())
  }

  static stopEmailMonitoring(id: string) {
    return apiRequest(api.post(`monitoring/email/${id}/stop`).json<unknown>())
  }

  static updateEmailMonitoring(
    id: string,
    update: {
      check_interval?: number
      folder?: string
    },
  ) {
    return apiRequest(
      api
        .put(`monitoring/email/${id}`, {
          json: update,
        })
        .json<unknown>(),
    )
  }

  static async deleteEmailMonitoring(id: string) {
    await apiRequest(api.delete(`monitoring/email/${id}`))
    return { success: true }
  }

  static getMonitoringStatus() {
    return apiRequest(api.get("monitoring/status").json<unknown>())
  }
}
