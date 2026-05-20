import type { Metadata } from "next"

import { NotificationsPageClient } from "@/components/notifications/notifications-page"

export const metadata: Metadata = {
  title: "Уведомления",
}

export default function NotificationsPage() {
  return <NotificationsPageClient />
}
