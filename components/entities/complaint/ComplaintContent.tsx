"use client"

import { useState } from "react"
import { toast } from "sonner"

import { API_BASE_URL } from "@/lib/api"
import { useUpdateComplaint, useUpdateComplaintLabels } from "@/lib/hooks/useComplaints"
import { ComplaintStatus } from "@/lib/types/complaint-status.type"
import { Complaint } from "@/lib/types/complaint.type"
import { complaintPlatformLabelRu } from "@/lib/utils/complaint-platform-label"

import { ComplaintMetadata } from "./ComplaintMetadata"
import { DashboardLabelPicker } from "./DashboardLabelPicker"
import { StatusBadge } from "./StatusBadge"

interface ComplaintContentProps {
  complaint: Complaint
}

function resolveMediaUrl(rawUrl?: string) {
  if (!rawUrl) {
    return undefined
  }

  try {
    return new URL(rawUrl, `${API_BASE_URL}/`).toString()
  } catch {
    return rawUrl
  }
}

export function ComplaintContent({ complaint }: ComplaintContentProps) {
  const updateComplaint = useUpdateComplaint()
  const updateLabels = useUpdateComplaintLabels()

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    updateComplaint.mutate(
      { id: complaint.id, body: { status: newStatus } },
      {
        onSuccess: () => toast.success("Статус обновлён"),
        onError: () => toast.error("Не удалось обновить статус"),
      },
    )
  }

  const handleDashboardLabelsChange = (label_ids: number[]) => {
    updateLabels.mutate(
      { id: complaint.id, label_ids },
      {
        onSuccess: () => toast.success("Метки обновлены"),
        onError: () => toast.error("Не удалось обновить метки"),
      },
    )
  }

  const mediaUrl = resolveMediaUrl(complaint.url || complaint.source_url)
  const busy = updateComplaint.isPending || updateLabels.isPending
  const [failedMediaUrl, setFailedMediaUrl] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{complaint.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">Карточка проблемы</p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 bg-muted/50 min-h-64 flex items-center justify-center">
            {!mediaUrl || failedMediaUrl === mediaUrl ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="96"
                height="96"
                viewBox="0 0 96 96"
                fill="none"
                className="text-muted-foreground/40"
              >
                <rect x="4" y="12" width="88" height="72" rx="6" stroke="currentColor" strokeWidth="4" />
                <circle cx="30" cy="36" r="10" stroke="currentColor" strokeWidth="4" />
                <polyline
                  points="4,76 32,44 54,64 70,48 92,76"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Изображение проблемы"
                className="max-w-full h-auto rounded"
                onError={() => setFailedMediaUrl(mediaUrl ?? null)}
              />
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Источник</h3>
            <p className="text-sm">{complaintPlatformLabelRu(complaint.platform)}</p>
            {mediaUrl && (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline block mt-2 truncate"
              >
                {mediaUrl}
              </a>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Описание</h3>
            <p className="text-sm whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Статус</h3>
              <StatusBadge
                status={complaint.status}
                editable={!busy}
                onStatusChange={handleStatusChange}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Метки дашборда</h3>
              <DashboardLabelPicker
                valueIds={(complaint.labels ?? []).map((l) => l.id)}
                onChange={handleDashboardLabelsChange}
                disabled={busy}
              />
            </div>

            <ComplaintMetadata complaint={complaint} />
          </div>
        </div>
      </div>
    </div>
  )
}
