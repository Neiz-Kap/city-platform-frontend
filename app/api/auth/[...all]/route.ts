import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/lib/auth"

/**
 * Better Auth API Route Handler
 *
 * This route handles all better-auth requests including:
 * - Session management
 * - Bearer token operations
 * - Authentication callbacks
 *
 * The handler is mounted at /api/auth/* and uses the better-auth
 * configuration from lib/auth.ts
 */
export const { POST, GET } = toNextJsHandler(auth)

// Export handlers for other HTTP methods if needed
export const OPTIONS = POST
