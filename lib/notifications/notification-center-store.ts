"use client"

import { useSyncExternalStore } from "react"

export type DashboardNotificationItem = {
  createdAt: string
  description: string
  href?: string
  id: string
  kind: "complaint"
  read: boolean
  title: string
}

type NotificationSnapshot = {
  items: DashboardNotificationItem[]
  unreadCount: number
}

const STORAGE_KEY = "ods-dashboard-notifications"
const MAX_ITEMS = 20

let hasLoadedFromStorage = false
let items: DashboardNotificationItem[] = []
const listeners = new Set<() => void>()
const EMPTY_ITEMS: DashboardNotificationItem[] = []
const SERVER_SNAPSHOT: NotificationSnapshot = {
  items: EMPTY_ITEMS,
  unreadCount: 0,
}
let snapshot: NotificationSnapshot = SERVER_SNAPSHOT

function buildSnapshot(nextItems: DashboardNotificationItem[]): NotificationSnapshot {
  return {
    items: nextItems,
    unreadCount: nextItems.filter((item) => !item.read).length,
  }
}

function setItems(
  nextItems:
    | DashboardNotificationItem[]
    | ((currentItems: DashboardNotificationItem[]) => DashboardNotificationItem[]),
) {
  const resolvedItems = typeof nextItems === "function" ? nextItems(items) : nextItems

  if (resolvedItems === items) {
    return false
  }

  items = resolvedItems
  snapshot = buildSnapshot(items)
  return true
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function persist() {
  if (typeof window === "undefined") return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function ensureLoaded() {
  if (hasLoadedFromStorage || typeof window === "undefined") {
    return
  }

  hasLoadedFromStorage = true

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) return

    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return

    setItems(
      parsed.filter((item): item is DashboardNotificationItem => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.description === "string" &&
          typeof item.createdAt === "string" &&
          typeof item.read === "boolean" &&
          item.kind === "complaint"
        )
      }),
    )
  } catch {
    setItems(EMPTY_ITEMS)
  }
}

function getSnapshot(): NotificationSnapshot {
  ensureLoaded()
  return snapshot
}

function getServerSnapshot(): NotificationSnapshot {
  return SERVER_SNAPSHOT
}

export function subscribeToNotificationCenter(listener: () => void) {
  ensureLoaded()
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function useNotificationCenter() {
  return useSyncExternalStore(subscribeToNotificationCenter, getSnapshot, getServerSnapshot)
}

export function pushDashboardNotification(item: Omit<DashboardNotificationItem, "read">) {
  ensureLoaded()

  setItems([{ ...item, read: false }, ...items].slice(0, MAX_ITEMS))
  persist()
  emitChange()
}

export function markNotificationAsRead(notificationId: string) {
  ensureLoaded()

  setItems(items.map((item) => (item.id === notificationId ? { ...item, read: true } : item)))
  persist()
  emitChange()
}

export function markAllNotificationsAsRead() {
  ensureLoaded()

  setItems(items.map((item) => ({ ...item, read: true })))
  persist()
  emitChange()
}
