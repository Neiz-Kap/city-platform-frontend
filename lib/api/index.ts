import ky from "ky"

import { normalizeApiError } from "./errors"

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

if (!rawApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required to run the ODS City frontend.")
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "")

const REFRESH_TOKEN_KEY = "refreshToken"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("accessToken", token)
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax"
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function isTokenExpiredPayload(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false
  const err = (payload as Record<string, unknown>).error
  if (typeof err !== "object" || err === null) return false
  return (err as Record<string, unknown>).code === "TOKEN_EXPIRED"
}

// Deduplicates concurrent refresh calls: all waiters share one in-flight promise.
let refreshPromise: Promise<string | null> | null = null

function silentRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return null
      try {
        const resp = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
        if (!resp.ok) return null
        const json = await resp.json()
        const newAccess: unknown = json?.data?.accessToken
        const newRefresh: unknown = json?.data?.refreshToken
        if (typeof newAccess !== "string") return null
        setAccessToken(newAccess)
        if (typeof newRefresh === "string") setRefreshToken(newRefresh)
        return newAccess
      } catch {
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15_000,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set("Accept", "application/json")
        if (!request.headers.has("Content-Type")) {
          request.headers.set("Content-Type", "application/json")
        }
        const token = getAccessToken()
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return

        // Only handle token expiry, not other 401s (wrong password, etc.)
        let payload: unknown
        try {
          payload = await response.clone().json()
        } catch {
          return
        }
        if (!isTokenExpiredPayload(payload)) return

        // Don't intercept the refresh endpoint itself to avoid infinite loops
        if (request.url.includes("/auth/refresh")) return

        const newToken = await silentRefresh()

        if (!newToken) {
          removeAccessToken()
          removeRefreshToken()
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/dashboard/login"
          }
          return
        }

        // Retry original request with new token
        const retryHeaders = new Headers(request.headers)
        retryHeaders.set("Authorization", `Bearer ${newToken}`)
        return fetch(new Request(request, { headers: retryHeaders }))
      },
    ],
  },
})

export async function apiRequest<T>(request: Promise<T>) {
  try {
    return await request
  } catch (error) {
    throw await normalizeApiError(error)
  }
}
