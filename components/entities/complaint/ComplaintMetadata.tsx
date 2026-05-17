"use client"

import { Complaint } from "@/lib/types/complaint.type"
import { formatRuLongDate } from "@/lib/utils/date-format"

interface ComplaintMetadataProps {
  complaint: Complaint
}

export function ComplaintMetadata({ complaint }: ComplaintMetadataProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-medium text-muted-foreground">Создано</h3>
        <p className="text-sm">{formatRuLongDate(complaint.createdAt)}</p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-muted-foreground">Изменено</h3>
        <p className="text-sm">{formatRuLongDate(complaint.updatedAt)}</p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-muted-foreground">Исполнитель</h3>
        <p className="text-sm">Платформа ODS</p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-muted-foreground">Идентификатор жалобы</h3>
        <p className="font-mono text-sm">№ {complaint.id}</p>
      </div>
    </div>
  )
}
