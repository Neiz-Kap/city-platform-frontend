"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PaginationInfo } from "@/lib/types"

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages } = pagination

  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeftIcon className="h-4 w-4 mr-2" />
        Назад
      </Button>
      <span className="text-sm text-muted-foreground">
        Страница {page} из {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
      >
        Вперед
        <ChevronRightIcon className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
