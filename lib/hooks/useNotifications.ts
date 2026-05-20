"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { NotificationAPI } from "../api/notifications.api"

export const notificationKeys = {
  all: () => ["notifications"] as const,
  preview: () => ["notifications", "preview"] as const,
  list: (page: number, search?: string) => ["notifications", "list", page, search ?? ""] as const,
}

export function useNotificationsPreview(lastReadNotificationId?: number) {
  return useQuery({
    queryKey: notificationKeys.preview(),
    queryFn: () => NotificationAPI.getList({ page: 1, limit: 10, lastReadNotificationId }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}

export function useNotificationsPage(page: number, search?: string, lastReadNotificationId?: number) {
  return useQuery({
    queryKey: notificationKeys.list(page, search),
    queryFn: () => NotificationAPI.getList({ page, limit: 20, search, lastReadNotificationId }),
    staleTime: 15_000,
  })
}

export function useMarkSeen() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lastNotificationId: number) => NotificationAPI.markSeen(lastNotificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    },
  })
}
