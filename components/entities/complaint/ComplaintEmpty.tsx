"use client"

import { Inbox, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ComplaintEmptyProps {
  isRefreshing?: boolean
  onRefresh?: () => void
}

/**
 * Empty state component for complaints page
 * Displayed when no complaints are available (first-time users)
 */
export function ComplaintEmpty({ isRefreshing = false, onRefresh }: ComplaintEmptyProps) {
  return (
    <Card className="my-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Предложений пока не поступало</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Ваш список предложений пуст. Предложения появятся автоматически, когда подключенные
          источники (VK, email) найдут новые обращения граждан.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/source">
            <Plus className="mr-2 h-4 w-4" />
            Подключить источники
          </Link>
        </Button>
        {onRefresh && (
          <Button variant="ghost" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
