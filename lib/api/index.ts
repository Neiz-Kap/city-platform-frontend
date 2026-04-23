import ky from "ky"

import { normalizeApiError } from "./errors"

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

if (!rawApiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required to run the ODS City frontend.",
  )
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "")

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
