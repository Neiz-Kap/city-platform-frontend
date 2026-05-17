import ky from "ky"

import { normalizeApiError } from "./errors"

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

if (!rawApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required to run the ODS City frontend.")
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "")

/**
 * Get access token from localStorage
 * Used for Bearer token authentication
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem("accessToken")
}

/**
 * Set access token in localStorage and sync cookie for middleware
 */
export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token)
    // Sync cookie for middleware access (HTTP-only cookie simulation)
    // The middleware checks for this cookie to determine auth status
    document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`
  }
}

/**
 * Remove access token from localStorage and clear cookie
 */
export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    // Clear the cookie
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax"
  }
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

        // Add Bearer token to Authorization header if available
        const token = getAccessToken()
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
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
