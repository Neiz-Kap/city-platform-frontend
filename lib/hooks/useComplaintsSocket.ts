// lib/hooks/useComplaintsSocket.ts
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "../api"
import { complaintKeys } from "./useComplaints"

interface UseComplaintsSocketProps {
  enabled?: boolean
  sources?: string[]
  interval?: number
}

export const useComplaintsSocket = ({
  enabled = true,
  sources = ["all"],
  interval = 300,
}: UseComplaintsSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (!enabled) return

    // Используем правильные настройки подключения
    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io/", // Явно указываем путь
      withCredentials: false,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("✅ WebSocket connected")
    })

    socket.on("connection_status", (data) => {
      console.log("📡 Connection status:", data)

      // Подписываемся на обновления после подключения
      socket.emit("subscribe_complaints", {
        sources,
        interval,
      })
    })

    socket.on("subscription_status", (data) => {
      console.log("📋 Subscription status:", data)
    })

    socket.on("new_complaint", (data) => {
      console.log("🆕 New complaint received:", data)

      // Инвалидируем кэш жалоб для принудительного обновления
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() }) // TODO: сделать оптимистик упдейт

      // Показываем уведомление
      if (Notification.permission === "granted") {
        new Notification("Новая жалоба", {
          body: `Поступила новая жалоба: ${data.name}`,
          icon: "/notification-icon.png",
        })
      }
    })

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason)
    })

    socket.on("error", (error) => {
      console.error("❌ WebSocket connection error:", error)
    })

    return socket
  }, [enabled, sources, interval, queryClient])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      console.log("🔌 WebSocket disconnected manually")
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      const socket = connect()

      return () => {
        disconnect()
      }
    }
  }, [enabled, connect, disconnect])

  // Функция для ручной отправки запроса на обновление
  const requestUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_update")
      return true
    }
    return false
  }, [])

  return {
    isConnected: socketRef.current?.connected || false,
    requestUpdate,
    disconnect,
    connect: () => connect(),
  }
}
