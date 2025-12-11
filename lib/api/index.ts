// import "@/app/envConfig"
import ky from "ky"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Create a configured ky instance
export const api = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        // Add unknown default headers here if needed
        request.headers.set("Content-Type", "application/json")
      },
    ],
  },
})
