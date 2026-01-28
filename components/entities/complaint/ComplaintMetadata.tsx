"use client"

import { Complaint } from "@/lib/types/complaint.type"
import { TagManager } from "./TagManager"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ComplaintMetadataProps {
  complaint: Complaint
  editable?: boolean
  onTagsChange?: (tags: string[]) => void
}

export function ComplaintMetadata({
  complaint,
  editable,
  onTagsChange,
}: ComplaintMetadataProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Создано
        </h3>
        <p className="text-sm">
          {format(new Date(complaint.createdAt), "PPP", { locale: ru })}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Изменено
        </h3>
        <p className="text-sm">
          {format(new Date(complaint.updatedAt), "PPP", { locale: ru })}
        </p>
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
          Метки
        </h3>
        <TagManager
          tags={complaint.tags}
          editable={editable}
          onTagsChange={onTagsChange}
        />
      </div>
    </div>
  )
}
