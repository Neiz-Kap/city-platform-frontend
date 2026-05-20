"use client"

import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { BellIcon, Clock3Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/lib/hooks/use-mobile"
import { useMarkSeen, useNotificationsPreview } from "@/lib/hooks/useNotifications"

function formatNotificationTime(createdAt: string) {
  return formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ru,
  })
}

const Notifications = () => {
  const isMobile = useIsMobile()
  const router = useRouter()
  const { data } = useNotificationsPreview()
  const markSeen = useMarkSeen()

  const unreadCount = data?.unreadCount ?? 0
  const lastNotificationId = data?.lastNotificationId ?? 0
  const items = data?.data ?? []

  const handleOpenNotification = (notificationId: number, complaintId?: number) => {
    markSeen.mutate(notificationId)
    if (complaintId) {
      router.push(`/dashboard/complaint/${complaintId}`)
    }
  }

  const handleMarkAllSeen = () => {
    if (items[0]) {
      markSeen.mutate(items[0].id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Уведомления">
          <BellIcon className={unreadCount > 0 ? "animate-tada" : undefined} />
          {unreadCount > 0 && (
            <span className="bg-destructive absolute end-0 top-0 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isMobile ? "center" : "end"}
        className="ms-4 w-96 max-w-[calc(100vw-2rem)] p-0"
      >
        <DropdownMenuLabel className="bg-background sticky top-0 z-10 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium">Уведомления</div>
              <div className="text-muted-foreground text-xs">
                {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Новых уведомлений нет"}
              </div>
            </div>
            <Button variant="link" className="h-auto p-0 text-xs" size="sm" asChild>
              <Link href="/dashboard/notifications">Показать все уведомления</Link>
            </Button>
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="max-h-[360px]">
          {items.length === 0 ? (
            <div className="text-muted-foreground px-4 py-10 text-center text-sm">
              Новые события появятся здесь автоматически.
            </div>
          ) : (
            items.map((item) => {
              const isUnread = item.id > lastNotificationId
              return (
                <DropdownMenuItem
                  key={item.id}
                  className="group flex cursor-pointer flex-col items-start gap-2 rounded-none border-b px-4 py-3"
                  onClick={() => handleOpenNotification(item.id, item.complaintId)}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                      <BellIcon className="size-4" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="truncate text-sm font-medium">
                          Обнаружена новая проблема!
                        </div>
                        {isUnread && (
                          <span className="bg-destructive/80 mt-1 block size-2 shrink-0 rounded-full" />
                        )}
                      </div>
                      <div className="text-muted-foreground line-clamp-2 text-xs">
                        {item.complaint.name.slice(0, 55)}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock3Icon className="size-3" />
                        {formatNotificationTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </ScrollArea>

        {unreadCount > 0 && (
          <div className="bg-background sticky bottom-0 border-t px-4 py-2">
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              size="sm"
              onClick={handleMarkAllSeen}
              disabled={markSeen.isPending}
            >
              Прочитать все
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Notifications
