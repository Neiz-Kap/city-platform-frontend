import { api } from ".";

/** @class Telegram Bot API */
export class TelegramBotAPI {
  private static prefix = "/telegram/bots";

  static async getAll() {
    try {
      const response = await api.get(this.prefix).json<unknown[]>();
      return response;
    } catch (error) {
      console.error("Error when retrieving telegram bots: ", error);
      throw error;
    }
  }

  static async create(botData: {
    token: string;
    start_message: string;
    response_message: string;
  }) {
    try {
      const response = await api
        .post(this.prefix, {
          json: botData,
        })
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when creating telegram bot: ", error);
      throw error;
    }
  }

  static async start(token: string) {
    try {
      const response = await api
        .post(`${this.prefix}/${token}/start`)
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when starting telegram bot: ", error);
      throw error;
    }
  }

  static async stop(token: string) {
    try {
      const response = await api
        .post(`${this.prefix}/${token}/stop`)
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when stopping telegram bot: ", error);
      throw error;
    }
  }

  static async updateSettings(
    token: string,
    settings: {
      start_message?: string;
      response_message?: string;
    },
  ) {
    try {
      const response = await api
        .put(`${this.prefix}/${token}/settings`, {
          json: settings,
        })
        .json<unknown>();
      return response;
    } catch (error) {
      console.error("Error when updating telegram bot settings: ", error);
      throw error;
    }
  }

  static async delete(token: string) {
    try {
      await api.delete(`${this.prefix}/${token}`);
      return { success: true };
    } catch (error) {
      console.error("Error when deleting telegram bot: ", error);
      throw error;
    }
  }
}
