import type { QueryClient } from "@tanstack/react-query"
import type { Socket } from "socket.io-client"
import { toast } from "sonner"

import { pushDashboardNotification } from "./notification-center-store"

export type DashboardNotificationContext = {
  onNewComplaint?: (payload: { id?: number; name?: string }) => void
  queryClient?: QueryClient
}

type ServerEventHandler = (
  socket: Socket,
  payload: unknown,
  ctx: DashboardNotificationContext,
) => void

export const dashboardSocketHandlers: Record<string, ServerEventHandler> = {
  new_complaint: (_socket, payload, ctx) => {
    const complaint = payload as { id?: number; name?: string }
    const title = complaint?.name?.trim() || "Новая жалоба"
    const href =
      typeof complaint?.id === "number" ? `/dashboard/complaint/${complaint.id}` : undefined

    pushDashboardNotification({
      createdAt: new Date().toISOString(),
      description: title,
      href,
      id: `complaint-${complaint?.id ?? crypto.randomUUID()}`,
      kind: "complaint",
      title: "Новая жалоба",
    })

    toast.info("Новая жалоба", {
      description: title,
    })

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Новая жалоба", {
        body: title,
        icon: "/notification-icon.png",
      })
    }

    ctx.onNewComplaint?.(complaint)
  },

  new_notification: (_socket, payload, ctx) => {
    const notification = payload as {
      id?: number
      complaintId?: number
      complaint?: { id?: number; name?: string }
      createdAt?: string
    }

    pushDashboardNotification({
      id: String(notification.id ?? crypto.randomUUID()),
      title: "Обнаружена новая проблема!",
      description: (notification.complaint?.name ?? "").slice(0, 55),
      createdAt: notification.createdAt ?? new Date().toISOString(),
      href:
        typeof notification.complaintId === "number"
          ? `/dashboard/complaint/${notification.complaintId}`
          : undefined,
      kind: "complaint",
    })

    ctx.queryClient?.invalidateQueries({ queryKey: ["notifications"] })

    toast.info("Обнаружена новая проблема!", {
      description: (notification.complaint?.name ?? "").slice(0, 55),
    })
  },
}

export function attachDashboardNotificationHandlers(
  socket: Socket,
  ctx: DashboardNotificationContext,
) {
  const unsubscribers: Array<() => void> = []

  for (const [event, handler] of Object.entries(dashboardSocketHandlers)) {
    const fn = (payload: unknown) => handler(socket, payload, ctx)
    socket.on(event, fn)
    unsubscribers.push(() => {
      socket.off(event, fn)
    })
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
  }
}
