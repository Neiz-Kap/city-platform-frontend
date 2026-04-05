import { api } from ".";

/** @class Monitoring API */
export class MonitoringAPI {
  // VK Monitoring
  static async startVKMonitoring() {
    try {
      const response = await api.post("monitoring/vk/start").json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when starting VK monitoring: ", error);
      throw error;
    }
  }

  static async stopVKMonitoring() {
    try {
      const response = await api.post("monitoring/vk/stop").json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when stopping VK monitoring: ", error);
      throw error;
    }
  }

  static async getVKMonitoringStatus() {
    try {
      const response = await api.get("monitoring/vk/status").json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when getting VK monitoring status: ", error);
      throw error;
    }
  }

  // Email Monitoring
  static async createEmailMonitoring(config: {
    name: string;
    imap_server: string;
    imap_port: number;
    email: string;
    password: string;
    folder: string;
    use_ssl: boolean;
    check_interval: number;
  }) {
    try {
      const response = await api
        .post("monitoring/email", {
          json: config,
        })
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when creating email monitoring: ", error);
      throw error;
    }
  }

  static async startEmailMonitoring(id: string) {
    try {
      const response = await api
        .post(`monitoring/email/${id}/start`)
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when starting email monitoring: ", error);
      throw error;
    }
  }

  static async stopEmailMonitoring(id: string) {
    try {
      const response = await api
        .post(`monitoring/email/${id}/stop`)
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when stopping email monitoring: ", error);
      throw error;
    }
  }

  static async updateEmailMonitoring(
    id: string,
    update: {
      check_interval?: number;
      folder?: string;
    },
  ) {
    try {
      const response = await api
        .put(`monitoring/email/${id}`, {
          json: update,
        })
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when updating email monitoring: ", error);
      throw error;
    }
  }

  static async deleteEmailMonitoring(id: string) {
    try {
      await api.delete(`monitoring/email/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error when deleting email monitoring: ", error);
      throw error;
    }
  }

  /** Агрегированный статус; в ответе больше нет блока `telegram_bots`. */
  static async getMonitoringStatus() {
    try {
      const response = await api.get("monitoring/status").json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when getting monitoring status: ", error);
      throw error;
    }
  }
}
