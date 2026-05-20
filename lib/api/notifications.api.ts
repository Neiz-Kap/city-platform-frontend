import { api, apiRequest } from "./index"

export interface NotificationComplaint {
  id: number
  name: string
  description?: string
}

export interface NotificationItem {
  id: number
  complaintId: number
  complaint: NotificationComplaint
  createdAt: string
}

export interface NotificationsListResponse {
  data: NotificationItem[]
  page: number
  limit: number
  total: number
  unreadCount: number
  lastNotificationId: number
}

export interface NotificationsParams {
  page?: number
  limit?: number
  lastReadNotificationId?: number
  search?: string
}

export class NotificationAPI {
  private static readonly prefix = "api/v1/notifications"

  static async getList(params: NotificationsParams = {}): Promise<NotificationsListResponse> {
    const searchParams: Record<string, string> = {}
    if (params.page !== undefined) searchParams.page = String(params.page)
    if (params.limit !== undefined) searchParams.limit = String(params.limit)
    if (params.lastReadNotificationId !== undefined)
      searchParams.lastReadNotificationId = String(params.lastReadNotificationId)
    if (params.search) searchParams.search = params.search

    return apiRequest(api.get(this.prefix, { searchParams }).json<NotificationsListResponse>())
  }

  static async markSeen(lastNotificationId: number): Promise<{ lastNotificationId: number }> {
    return apiRequest(
      api
        .patch(`${this.prefix}/seen`, { json: { lastNotificationId } })
        .json<{ lastNotificationId: number }>(),
    )
  }
}
