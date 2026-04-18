// lib/hooks/useComplaintsSocket.ts
import { attachDashboardNotificationHandlers } from "@/lib/notifications/dashboard-notifications"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "../api"
import { complaintKeys } from "./useComplaints"

interface UseComplaintsSocketProps {
  enabled?: boolean
  sources?: string[]
  interval?: number
  onNewComplaint?: () => void
}

export const useComplaintsSocket = ({
  enabled = true,
  sources = ["all"],
  interval = 300,
  onNewComplaint,
}: UseComplaintsSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const onNewComplaintRef = useRef(onNewComplaint)
  onNewComplaintRef.current = onNewComplaint

  const disconnect = useCallback(() => {
    const s = socketRef.current as (Socket & { _odsCleanup?: () => void }) | null
    if (s) {
      s._odsCleanup?.()
      s.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    if (!enabled) return

    disconnect()

    // В dev через HTTP-туннели (CloudPub и т.п.) чистый WebSocket часто ломается
    // («Invalid frame header»); long-polling идёт обычными GET/POST.
    const isDev = process.env.NODE_ENV === "development"

    const socket = io(API_BASE_URL, {
      path: "/socket.io/",
      withCredentials: false,
      ...(isDev
        ? { transports: ["polling"], upgrade: false }
        : { transports: ["websocket", "polling"] }),
    })

    socketRef.current = socket

    const subscribe = () => {
      socket.emit("subscribe_complaints", { sources, interval })
    }

    const detachNotifications = attachDashboardNotificationHandlers(socket, {
      onNewComplaint: () => {
        queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
        onNewComplaintRef.current?.()
      },
    })

    const onConnect = () => {
      setIsConnected(true)
      subscribe()
    }

    const onDisconnect = (reason: string) => {
      setIsConnected(false)
      console.log("Socket disconnected:", reason)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connection_status", subscribe)
    socket.on("subscription_status", () => {})
    socket.on("error", (error: Error) => {
      console.error("Socket connection error:", error)
    })

    const cleanup = () => {
      detachNotifications()
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connection_status", subscribe)
      socket.off("subscription_status")
      socket.off("error")
    }

    ;(socket as Socket & { _odsCleanup?: () => void })._odsCleanup = cleanup

    return socket
  }, [enabled, sources, interval, queryClient, disconnect])

  useEffect(() => {
    if (!enabled) {
      disconnect()
      return undefined
    }
    connect()
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  const requestUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_update")
      return true
    }
    return false
  }, [])

  return {
    isConnected,
    requestUpdate,
    disconnect,
    connect: () => connect(),
  }
}
