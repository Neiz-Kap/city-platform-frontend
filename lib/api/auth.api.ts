import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "@/lib/types/auth.types"

import { api, apiRequest } from "."

/**
 * Authentication API client
 * Based on API_AUTH_CONTRACT.md
 *
 * All endpoints return wrapped responses with { success: true, data: ... }
 */
export class AuthAPI {
  private static readonly prefix = "api/v1/auth"

  /**
   * POST /api/v1/auth/register
   * Register a new user with email, password, and name
   */
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiRequest(
      api
        .post(`${this.prefix}/register`, { json: data })
        .json<{ success: true; data: RegisterResponse }>(),
    )
    return response.data
  }

  /**
   * POST /api/v1/auth/login
   * Login with email and password, returns access token
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiRequest(
      api
        .post(`${this.prefix}/login`, { json: data })
        .json<{ success: true; data: LoginResponse }>(),
    )
    return response.data
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile (requires Bearer token)
   */
  static async getMe(): Promise<User> {
    const response = await apiRequest(
      api.get(`${this.prefix}/me`).json<{ success: true; data: User }>(),
    )
    return response.data
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset email
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiRequest(
      api.post(`${this.prefix}/forgot-password`, { json: data }).json<ForgotPasswordResponse>(),
    )
    return response
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiRequest(
      api.post(`${this.prefix}/reset-password`, { json: data }).json<ResetPasswordResponse>(),
    )
    return response
  }

  /**
   * POST /api/v1/auth/change-password
   * Change password for authenticated user
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiRequest(
      api.post(`${this.prefix}/change-password`, { json: data }).json<ChangePasswordResponse>(),
    )
    return response
  }

  /**
   * DELETE /api/v1/auth/me
   * Soft delete current user account
   */
  static async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await apiRequest(
      api.delete(`${this.prefix}/me`, { json: data }).json<DeleteAccountResponse>(),
    )
    return response
  }

  /**
   * Logout - client-side only, clears stored token
   */
  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
    }
  }
}
