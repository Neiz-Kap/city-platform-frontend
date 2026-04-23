import type { Socket } from "socket.io-client"
import { toast } from "sonner"

import { pushDashboardNotification } from "./notification-center-store"

export type DashboardNotificationContext = {
  onNewComplaint?: (payload: { id?: number; name?: string }) => void
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
      typeof complaint?.id === "number"
        ? `/dashboard/complaint/${complaint.id}`
        : undefined

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

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification("Новая жалоба", {
        body: title,
        icon: "/notification-icon.png",
      })
    }

    ctx.onNewComplaint?.(complaint)
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
