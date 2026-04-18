"use client"

import { Complaint } from "@/lib/types/complaint.type"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplaintMetadata } from "./ComplaintMetadata"
import { StatusBadge } from "./StatusBadge"
import { DashboardLabelPicker } from "./DashboardLabelPicker"
import {
  useUpdateComplaint,
  useUpdateComplaintLabels,
} from "@/lib/hooks/useComplaints"
import { toast } from "sonner"
import { ComplaintStatus } from "@/lib/types/complaint-status.type"
import { useEffect, useState } from "react"

interface ComplaintContentProps {
  complaint: Complaint
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

  const mediaUrl = complaint.url || complaint.source_url
  const busy = updateComplaint.isPending || updateLabels.isPending
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [mediaUrl])

  const showImage = Boolean(mediaUrl) && !imageFailed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{complaint.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Карточка проблемы
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="responsible">Ответственные</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-6 bg-muted/50 min-h-64 flex items-center justify-center">
                {showImage ? (
                  <img
                    src={mediaUrl}
                    alt="Изображение проблемы"
                    className="max-w-full h-auto rounded"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <p className="text-muted-foreground text-center text-sm px-4">
                    {mediaUrl
                      ? "Не удалось загрузить изображение по ссылке"
                      : "Нет изображения"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Категория
                  </h3>
                  <p className="text-sm">
                    {complaint.category || "non-classified"}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Источник
                  </h3>
                  <p className="text-sm">{complaint.platform}</p>
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
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Описание
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Статус
                  </h3>
                  <StatusBadge
                    status={complaint.status}
                    editable={!busy}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Метки дашборда
                  </h3>
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
        </TabsContent>

        <TabsContent value="responsible" className="mt-6">
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Вкладка &quot;Ответственные&quot; в разработке
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
