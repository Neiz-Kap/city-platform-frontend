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
  COMPLAINT_STATUS_COLORS,
  COMPLAINT_STATUS_LABELS,
  ComplaintStatus,
  getStatusLabelRu,
  parseComplaintStatus,
} from "@/lib/types/complaint-status.type"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  editable?: boolean
  onStatusChange?: (status: ComplaintStatus) => void
}

const FIXED_STATUSES: ComplaintStatus[] = [
  ComplaintStatus.BACKLOG,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.DONE,
]

export function StatusBadge({ status, editable = false, onStatusChange }: StatusBadgeProps) {
  const parsed = parseComplaintStatus(status)
  const label = parsed ? COMPLAINT_STATUS_LABELS[parsed] : getStatusLabelRu(status)
  const colorClass = parsed ? COMPLAINT_STATUS_COLORS[parsed] : "bg-slate-500"

  if (!editable) {
    return <Badge className={cn(colorClass, "text-white")}>{label}</Badge>
  }

  const selectValue = parsed ?? ComplaintStatus.BACKLOG

  return (
    <Select
      value={selectValue}
      onValueChange={(value) => onStatusChange?.(value as ComplaintStatus)}
    >
      <SelectTrigger className="w-full min-w-[140px]">
        <SelectValue>
          <Badge className={cn(COMPLAINT_STATUS_COLORS[selectValue], "text-white")}>
            {COMPLAINT_STATUS_LABELS[selectValue]}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FIXED_STATUSES.map((statusValue) => (
          <SelectItem key={statusValue} value={statusValue}>
            <Badge className={cn(COMPLAINT_STATUS_COLORS[statusValue], "text-white")}>
              {COMPLAINT_STATUS_LABELS[statusValue]}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
