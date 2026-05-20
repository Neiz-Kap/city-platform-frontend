"use client"

import { useSyncExternalStore } from "react"

export type DashboardNotificationItem = {
  createdAt: string
  description: string
  href?: string
  id: string
  kind: "complaint"
  title: string
}

type NotificationSnapshot = {
  items: DashboardNotificationItem[]
}

let items: DashboardNotificationItem[] = []
const listeners = new Set<() => void>()
const EMPTY_ITEMS: DashboardNotificationItem[] = []
const SERVER_SNAPSHOT: NotificationSnapshot = { items: EMPTY_ITEMS }
let snapshot: NotificationSnapshot = SERVER_SNAPSHOT

function buildSnapshot(nextItems: DashboardNotificationItem[]): NotificationSnapshot {
  return { items: nextItems }
}

function setItems(
  nextItems:
    | DashboardNotificationItem[]
    | ((currentItems: DashboardNotificationItem[]) => DashboardNotificationItem[]),
) {
  const resolvedItems = typeof nextItems === "function" ? nextItems(items) : nextItems
  if (resolvedItems === items) return false
  items = resolvedItems
  snapshot = buildSnapshot(items)
  return true
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): NotificationSnapshot {
  return snapshot
}

function getServerSnapshot(): NotificationSnapshot {
  return SERVER_SNAPSHOT
}

export function subscribeToNotificationCenter(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useNotificationCenter() {
  return useSyncExternalStore(subscribeToNotificationCenter, getSnapshot, getServerSnapshot)
}

export function pushDashboardNotification(item: DashboardNotificationItem) {
  setItems([item, ...items].slice(0, 5))
  emitChange()
}

export function clearDashboardNotifications() {
  setItems(EMPTY_ITEMS)
  emitChange()
}
