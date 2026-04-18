"use client"

import { Button } from "@/components/ui/button"
import type { ComplaintsAggregates } from "@/lib/types/complaint.type"
import {
  COMPLAINT_STATUS_LABELS,
  ComplaintStatus,
  getStatusLabelRu,
  parseComplaintStatus,
} from "@/lib/types/complaint-status.type"
import { cn } from "@/lib/utils"

const ORDERED_STATUSES: ComplaintStatus[] = [
  ComplaintStatus.BACKLOG,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.DONE,
]

type Props = {
  aggregates: ComplaintsAggregates | undefined
  selectedStatuses: string[]
  selectedLabelIds: number[]
  onToggleStatus: (statusKey: string) => void
  onToggleLabel: (labelId: number) => void
}

export function ComplaintAggregatesBar({
  aggregates,
  selectedStatuses,
  selectedLabelIds,
  onToggleStatus,
  onToggleLabel,
}: Props) {
  if (!aggregates) return null

  const { counts_by_status, counts_by_label } = aggregates

  return (
    <div className="flex flex-col gap-3 mb-4 p-4 rounded-lg border bg-muted/30">
      <div className="text-sm font-medium text-muted-foreground">
        Сводка (нажмите, чтобы добавить / снять фильтр)
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground mr-1">Статусы:</span>
        {ORDERED_STATUSES.map((key) => {
          const count = counts_by_status[key] ?? 0
          const active = selectedStatuses.includes(key)
          return (
            <Button
              key={key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => onToggleStatus(key)}
            >
              {COMPLAINT_STATUS_LABELS[key]} ({count})
            </Button>
          )
        })}
        {Object.entries(counts_by_status).map(([key, count]) => {
          if (ORDERED_STATUSES.includes(key as ComplaintStatus)) return null
          const parsed = parseComplaintStatus(key)
          const label = parsed
            ? COMPLAINT_STATUS_LABELS[parsed]
            : getStatusLabelRu(key)
          const active = selectedStatuses.includes(key)
          return (
            <Button
              key={key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => onToggleStatus(key)}
            >
              {label} ({count})
            </Button>
          )
        })}
      </div>
      {counts_by_label.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground mr-1">Метки:</span>
          {counts_by_label.map((l) => {
            const active = selectedLabelIds.includes(l.id)
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onToggleLabel(l.id)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium border transition-opacity",
                  active && "ring-2 ring-primary ring-offset-2",
                )}
                style={{
                  backgroundColor: l.color,
                  color: "#fff",
                  borderColor: l.color,
                }}
              >
                {l.name} ({l.complaint_count})
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
