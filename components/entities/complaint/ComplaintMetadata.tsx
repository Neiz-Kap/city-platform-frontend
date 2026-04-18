"use client"

import { Complaint } from "@/lib/types/complaint.type"
import { format, isValid } from "date-fns"
import { ru } from "date-fns/locale"
import { TagManager } from "./TagManager"

interface ComplaintMetadataProps {
  complaint: Complaint
}

function safeFormat(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isValid(d) ? format(d, "PPP", { locale: ru }) : "—"
}

export function ComplaintMetadata({ complaint }: ComplaintMetadataProps) {
  const tags = complaint.tags ?? []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Создано
        </h3>
        <p className="text-sm">{safeFormat(complaint.createdAt)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Изменено
        </h3>
        <p className="text-sm">{safeFormat(complaint.updatedAt)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Исполнитель
        </h3>
        <p className="text-sm">ODS Platform</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          ID проблемы
        </h3>
        <p className="text-sm font-mono">ID: {complaint.id}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Теги парсера
        </h3>
        <TagManager tags={tags} editable={false} />
      </div>
    </div>
  )
}
