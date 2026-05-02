"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/hooks/useAuth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { SiteHeader } from "@/components/layout/header"

/**
 * Authenticated Layout
 *
 * This layout is used for all protected routes.
 * It:
 * 1. Checks if user is authenticated
 * 2. Shows loading state while checking
 * 3. Redirects to login if not authenticated
 * 4. Renders the app sidebar and header for authenticated users
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoadingUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, isLoadingUser, router])

  // Show loading while checking auth status
  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Render the protected layout with sidebar
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
