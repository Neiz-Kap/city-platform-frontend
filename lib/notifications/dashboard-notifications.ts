import type { Socket } from "socket.io-client"
import { toast } from "sonner"

export type DashboardNotificationContext = {
  onNewComplaint?: (payload: { name?: string; id?: number }) => void
}

type ServerEventHandler = (
  socket: Socket,
  payload: unknown,
  ctx: DashboardNotificationContext,
) => void

/** Расширяйте при появлении новых событий с бэкенда (платформа, политики и т.д.). */
export const dashboardSocketHandlers: Record<string, ServerEventHandler> = {
  new_complaint: (_socket, payload, ctx) => {
    const p = payload as { name?: string; id?: number }
    const title = p?.name?.trim() || "Новая жалоба"
    toast.info("Новая жалоба", { description: title })
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Новая жалоба", {
        body: title,
        icon: "/notification-icon.png",
      })
    }
    ctx.onNewComplaint?.(p)
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
    unsubscribers.forEach((u) => u())
  }
}
