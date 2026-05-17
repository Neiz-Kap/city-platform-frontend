"use client"

import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, Clock3Icon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useMarkSeen, useNotificationsPage } from "@/lib/hooks/useNotifications"
import { cn } from "@/lib/utils"

function formatNotificationTime(createdAt: string) {
  return formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ru,
  })
}

export function NotificationsPageClient() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const markSeen = useMarkSeen()

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading } = useNotificationsPage(page, debouncedSearch)

  const items = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0
  const lastNotificationId = data?.lastNotificationId ?? 0
  const total = data?.total ?? 0
  const limit = data?.limit ?? 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleNotificationClick = (notificationId: number, complaintId?: number) => {
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
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Уведомления</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllSeen}
            disabled={markSeen.isPending}
          >
            Прочитать все ({unreadCount})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          placeholder="Поиск уведомлений..."
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="rounded-lg border">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground px-4 py-16 text-center text-sm">
            Уведомлений пока нет
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => {
              const isUnread = item.id > lastNotificationId
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "hover:bg-muted/50 flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors",
                    isUnread && "bg-primary/5",
                  )}
                  onClick={() => handleNotificationClick(item.id, item.complaintId)}
                >
                  <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                    <BellIcon className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="truncate text-sm font-medium">
                        Обнаружена новая проблема!
                      </span>
                      {isUnread && (
                        <span className="bg-destructive/80 mt-1.5 block size-2 shrink-0 rounded-full" />
                      )}
                    </div>
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {item.complaint.name.slice(0, 55)}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock3Icon className="size-3" />
                      {formatNotificationTime(item.createdAt)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeftIcon className="size-4" />
            Назад
          </Button>
          <span className="text-muted-foreground text-sm">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Вперёд
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
