import { betterAuth } from "better-auth"
import { bearer } from "better-auth/plugins"

/**
 * Better Auth configuration with Bearer token plugin
 *
 * This configuration uses Bearer tokens that are passed via Authorization header.
 * The actual authentication is handled by the external backend API (/api/v1/auth/*).
 * Better-auth here serves as a session management layer.
 */
export const auth = betterAuth({
  // Bearer token plugin for Authorization header support
  plugins: [bearer()],

  // Email and password authentication enabled
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  // Session configuration
  // JWT tokens with 1 hour lifetime (as per API contract)
  session: {
    expiresIn: 60 * 60, // 1 hour in seconds
    updateAge: 60 * 60, // 1 hour
  },

  // Advanced configuration for Bearer token flow
  advanced: {
    // Use cross-subdomain cookies for token sync (if needed)
    crossSubDomainCookies: {
      enabled: false,
    },
    // Disable default cookie attributes since we use Bearer tokens
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    },
  },

  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET,

  // Base URL
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",

  // Database configuration
  // Note: Since we're using external backend API for auth,
  // we don't need a local database for auth tables.
  // The auth database field is optional for our Bearer token flow.
  database: undefined,

  // Social providers (can be enabled later)
  socialProviders: {},

  // Custom hooks for integration with external backend
  hooks: {
    // Before login/signup hooks can be added here
    // to sync with external backend API
  },
})

// Export types
type Auth = typeof auth

export type { Auth }
