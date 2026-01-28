"use client"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ComplaintStatus,
  COMPLAINT_STATUS_COLORS,
  COMPLAINT_STATUS_LABELS,
} from "@/lib/types/complaint-status.type"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: ComplaintStatus
  editable?: boolean
  onStatusChange?: (status: ComplaintStatus) => void
}

export function StatusBadge({
  status,
  editable = false,
  onStatusChange,
}: StatusBadgeProps) {
  if (!editable) {
    return (
      <Badge className={cn(COMPLAINT_STATUS_COLORS[status], "text-white")}>
        {COMPLAINT_STATUS_LABELS[status]}
      </Badge>
    )
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange?.(value as ComplaintStatus)}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          <Badge className={cn(COMPLAINT_STATUS_COLORS[status], "text-white")}>
            {COMPLAINT_STATUS_LABELS[status]}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.values(ComplaintStatus).map((statusValue) => (
          <SelectItem key={statusValue} value={statusValue}>
            <Badge
              className={cn(
                COMPLAINT_STATUS_COLORS[statusValue],
                "text-white"
              )}
            >
              {COMPLAINT_STATUS_LABELS[statusValue]}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
