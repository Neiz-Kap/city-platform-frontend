"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { shouldRetryRequest } from "@/lib/api/errors"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) =>
              shouldRetryRequest(failureCount, error),
            staleTime: 60 * 1000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
