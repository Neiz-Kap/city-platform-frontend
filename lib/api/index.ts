import ky from "ky"

const API_BASE_URL = "https://eternally-equitable-petrel.cloudpub.ru"

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
