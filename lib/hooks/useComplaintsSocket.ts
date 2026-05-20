import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

import { useQueryClient } from "@tanstack/react-query"

import { attachDashboardNotificationHandlers } from "@/lib/notifications/dashboard-notifications"

import { API_BASE_URL } from "../api"
import { complaintAggregatesKey, complaintKeys } from "./useComplaints"

interface UseComplaintsSocketProps {
  enabled?: boolean
  interval?: number
  onNewComplaint?: () => void
  sources?: string[]
  userId?: number
}

function shouldUsePollingOnly(apiBaseUrl: string) {
  try {
    const url = new URL(apiBaseUrl)
    return (
      process.env.NODE_ENV === "development" || ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  } catch {
    return process.env.NODE_ENV === "development"
  }
}

export const useComplaintsSocket = ({
  enabled = true,
  sources = ["all"],
  interval = 300,
  onNewComplaint,
  userId,
}: UseComplaintsSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const connectRef = useRef<() => void>(() => {})
  const disconnectRef = useRef<() => void>(() => {})
  const resubscribeRef = useRef<() => boolean>(() => false)
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const onNewComplaintRef = useRef(onNewComplaint)
  const sourcesKey = [...sources].sort().join("|")
  const normalizedSources = useMemo(() => (sourcesKey ? sourcesKey.split("|") : []), [sourcesKey])
  const usePollingOnly = useMemo(() => shouldUsePollingOnly(API_BASE_URL), [])

  useEffect(() => {
    onNewComplaintRef.current = onNewComplaint
  }, [onNewComplaint])

  useEffect(() => {
    if (!enabled) {
      disconnectRef.current()
      resubscribeRef.current = () => false
      return undefined
    }

    const socket = io(API_BASE_URL, {
      path: "/socket.io/",
      reconnection: true,
      withCredentials: false,
      ...(usePollingOnly
        ? { transports: ["polling"], upgrade: false }
        : { transports: ["websocket", "polling"] }),
    })

    socketRef.current = socket

    const subscribe = () => {
      socket.emit("subscribe_complaints", {
        userId,
        interval,
        sources: normalizedSources,
      })
      return true
    }

    const detachNotifications = attachDashboardNotificationHandlers(socket, {
      onNewComplaint: () => {
        queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
        queryClient.invalidateQueries({ queryKey: complaintAggregatesKey })
        onNewComplaintRef.current?.()
      },
      queryClient,
    })

    const onConnect = () => {
      setIsConnected(true)
      subscribe()
    }

    const onDisconnect = (reason: string) => {
      setIsConnected(false)
      console.info("Socket disconnected:", reason)
    }

    const onError = (error: Error) => {
      setIsConnected(false)
      console.error("Socket connection error:", error)
    }

    const disconnectCurrentSocket = () => {
      detachNotifications()
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("error", onError)
      if (socketRef.current === socket) {
        socketRef.current = null
      }
      socket.disconnect()
      setIsConnected(false)
    }

    connectRef.current = () => {
      if (!socket.connected) {
        socket.connect()
      }
    }
    disconnectRef.current = disconnectCurrentSocket
    resubscribeRef.current = () => (socket.connected ? subscribe() : false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("error", onError)

    return () => {
      disconnectCurrentSocket()
      connectRef.current = () => {}
      disconnectRef.current = () => {}
      resubscribeRef.current = () => false
    }
  }, [enabled, interval, normalizedSources, queryClient, usePollingOnly, userId])

  const connect = useCallback(() => {
    connectRef.current()
  }, [])

  const disconnect = useCallback(() => {
    disconnectRef.current()
  }, [])

  const requestUpdate = useCallback(() => {
    return resubscribeRef.current()
  }, [])

  return {
    connect,
    disconnect,
    isConnected,
    requestUpdate,
  }
}
