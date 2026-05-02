"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { AuthAPI } from "@/lib/api/auth.api"
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/lib/api"
import { getErrorMessage } from "@/lib/api/errors"
import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "@/lib/types/auth.types"

// Query keys for auth
const authKeys = {
  user: ["auth", "user"] as const,
  token: ["auth", "token"] as const,
}

/**
 * Check if user is authenticated based on token presence
 */
export function checkIsAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return !!getAccessToken()
}

/**
 * Main auth hook with TanStack Query
 * Provides registration, login, logout, and user profile management
 */
export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Query: Get current user profile
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: authKeys.user,
    queryFn: async () => {
      const token = getAccessToken()
      if (!token) {
        return null
      }
      try {
        return await AuthAPI.getMe()
      } catch {
        // If 401, clear token and return null
        removeAccessToken()
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401
      if (error instanceof Error && error.message.includes("401")) {
        return false
      }
      return failureCount < 2
    },
  })

  // Mutation: Register new user
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      return AuthAPI.register(data)
    },
    onSuccess: () => {
      toast.success("Аккаунт успешно создан! Теперь войдите в систему.")
      router.push("/dashboard/login")
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать аккаунт")
      toast.error(message)
    },
  })

  // Mutation: Login user
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await AuthAPI.login(data)
      // Store the access token
      setAccessToken(response.accessToken)
      return response
    },
    onSuccess: async () => {
      toast.success("Вход выполнен успешно!")
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: authKeys.user })
      router.push("/dashboard")
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Неверный email или пароль")
      toast.error(message)
    },
  })

  // Mutation: Logout user
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clear token on client side
      removeAccessToken()
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(authKeys.user, null)
      queryClient.clear()
      toast.success("Вы вышли из системы")
      router.push("/dashboard/login")
    },
    onError: () => {
      // Even if something goes wrong, clear everything and redirect
      removeAccessToken()
      queryClient.setQueryData(authKeys.user, null)
      router.push("/dashboard/login")
    },
  })

  return {
    // User data
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    userError,
    refetchUser,

    // Actions
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}

/**
 * Hook for accessing user data only (no mutations)
 * Useful for components that just need to display user info
 */
export function useUser() {
  const { user, isLoadingUser, isAuthenticated, refetchUser } = useAuth()
  return { user, isLoading: isLoadingUser, isAuthenticated, refetchUser }
}

/**
 * Hook for auth actions only (no user data)
 * Useful for forms and buttons
 */
export function useAuthActions() {
  const { register, login, logout, isRegistering, isLoggingIn, isLoggingOut } =
    useAuth()
  return {
    register,
    login,
    logout,
    isRegistering,
    isLoggingIn,
    isLoggingOut,
  }
}
