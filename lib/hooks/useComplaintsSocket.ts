import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

import { attachDashboardNotificationHandlers } from "@/lib/notifications/dashboard-notifications"

import { API_BASE_URL } from "../api"
import { complaintAggregatesKey, complaintKeys } from "./useComplaints"

interface UseComplaintsSocketProps {
  enabled?: boolean
  interval?: number
  onNewComplaint?: () => void
  sources?: string[]
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

  useEffect(() => {
    onNewComplaintRef.current = onNewComplaint
  }, [onNewComplaint])

  const disconnect = useCallback(() => {
    const socket = socketRef.current as
      | (Socket & { _odsCleanup?: () => void })
      | null
    if (socket) {
      socket._odsCleanup?.()
      socket.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    if (!enabled) return

    disconnect()

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
      socket.emit("subscribe_complaints", { interval, sources })
    }

    const detachNotifications = attachDashboardNotificationHandlers(socket, {
      onNewComplaint: () => {
        queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
        queryClient.invalidateQueries({ queryKey: complaintAggregatesKey })
        onNewComplaintRef.current?.()
      },
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

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connection_status", subscribe)
    socket.on("subscription_status", () => {})
    socket.on("error", onError)

    const cleanup = () => {
      detachNotifications()
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connection_status", subscribe)
      socket.off("subscription_status")
      socket.off("error", onError)
    }

    ;(socket as Socket & { _odsCleanup?: () => void })._odsCleanup = cleanup

    return socket
  }, [enabled, disconnect, interval, queryClient, sources])

  useEffect(() => {
    if (!enabled) return undefined

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    connect: () => connect(),
    disconnect,
    isConnected,
    requestUpdate,
  }
}
