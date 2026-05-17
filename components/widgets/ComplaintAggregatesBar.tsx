"use client"

import { Button } from "@/components/ui/button"
import {
  COMPLAINT_STATUS_LABELS,
  ComplaintStatus,
  getStatusLabelRu,
  parseComplaintStatus,
} from "@/lib/types/complaint-status.type"
import type { ComplaintsAggregates } from "@/lib/types/complaint.type"
import { cn } from "@/lib/utils"

const ORDERED_STATUSES: ComplaintStatus[] = [
  ComplaintStatus.BACKLOG,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.DONE,
]

type Props = {
  aggregates: ComplaintsAggregates | undefined
  selectedLabelIds: number[]
  selectedStatuses: string[]
  onToggleLabel: (labelId: number) => void
  onToggleStatus: (statusKey: string) => void
}

function darkenHexColor(hex: string, amount = 24) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return hex

  let normalized = match[1]
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const value = Number.parseInt(normalized, 16)
  const channel = (shift: number) => Math.max(0, ((value >> shift) & 255) - amount)

  return `#${[channel(16), channel(8), channel(0)]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")}`
}

export function ComplaintAggregatesBar({
  aggregates,
  selectedStatuses,
  selectedLabelIds,
  onToggleStatus,
  onToggleLabel,
}: Props) {
  if (!aggregates) return null

  const counts_by_status = aggregates.counts_by_status ?? {}
  const counts_by_label = aggregates.counts_by_label ?? []

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="text-sm font-medium text-muted-foreground">
        Сводка (нажмите, чтобы добавить или снять фильтр)
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Статусы:</span>
        {ORDERED_STATUSES.map((key) => {
          const count = counts_by_status[key] ?? 0
          const active = selectedStatuses.includes(key)

          return (
            <Button
              key={key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className={cn("h-8", active && "text-white")}
              onClick={() => onToggleStatus(key)}
            >
              {COMPLAINT_STATUS_LABELS[key]} ({count})
            </Button>
          )
        })}
        {Object.entries(counts_by_status).map(([key, count]) => {
          if (ORDERED_STATUSES.includes(key as ComplaintStatus)) return null
          const parsed = parseComplaintStatus(key)
          const label = parsed ? COMPLAINT_STATUS_LABELS[parsed] : getStatusLabelRu(key)
          const active = selectedStatuses.includes(key)

          return (
            <Button
              key={key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className={cn("h-8", active && "text-white")}
              onClick={() => onToggleStatus(key)}
            >
              {label} ({count})
            </Button>
          )
        })}
      </div>
      {counts_by_label.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">Метки:</span>
          {counts_by_label.map((label) => {
            const active = selectedLabelIds.includes(label.id)

            return (
              <button
                key={label.id}
                type="button"
                onClick={() => onToggleLabel(label.id)}
                className={cn(
                  "rounded-full border-2 px-2.5 py-0.5 text-xs font-medium text-white transition-opacity",
                  !active && "opacity-85 hover:opacity-100",
                )}
                style={{
                  backgroundColor: label.color,
                  borderColor: active ? darkenHexColor(label.color) : "transparent",
                  color: "#fff",
                }}
              >
                {label.name} ({label.complaint_count})
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
