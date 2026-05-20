/**
 * Types for Authentication API Contract
 * Based on API_AUTH_CONTRACT.md
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * POST /api/v1/auth/register
 */
export interface RegisterRequest {
  email: string
  password: string
  name: string
}

/**
 * POST /api/v1/auth/login
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * POST /api/v1/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string
}

/**
 * POST /api/v1/auth/reset-password
 */
export interface ResetPasswordRequest {
  resetToken: string
  newPassword: string
}

/**
 * POST /api/v1/auth/change-password
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * DELETE /api/v1/auth/me (soft delete)
 */
export interface DeleteAccountRequest {
  password: string
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response 201 Created for register
 */
export interface RegisterResponse {
  userId: number
  email: string
  name: string
  createdAt: string
}

/**
 * Response 200 OK for login
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Response 200 OK for forgot-password
 */
export interface ForgotPasswordResponse {
  success: true
  message: string
  data?: {
    resetToken: string
  }
}

/**
 * Response 200 OK for reset-password
 */
export interface ResetPasswordResponse {
  success: true
  message: string
}

/**
 * Response 200 OK for change-password
 */
export interface ChangePasswordResponse {
  success: true
  message: string
}

/**
 * Response 200 OK for delete account
 */
export interface DeleteAccountResponse {
  success: true
  message: string
  data: {
    deletedAt: string
  }
}

// ============================================================================
// User Types
// ============================================================================

/**
 * GET /api/v1/auth/me - User profile
 */
export interface User {
  userId: number
  email: string
  name: string
  createdAt: string
}

// ============================================================================
// Error Types
// ============================================================================

export interface AuthErrorDetails {
  [field: string]: string
}

export interface AuthError {
  code: string
  message: string
  details?: AuthErrorDetails
}

export interface ApiErrorResponse {
  success: false
  error: AuthError
}

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiMessageResponse {
  success: true
  message: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// Token Types
// ============================================================================

export interface TokenPayload {
  sub: string // userId
  email: string
  iat: number
  exp: number
}
