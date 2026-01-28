"use client"

import { Complaint } from "@/lib/types/complaint.type"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplaintMetadata } from "./ComplaintMetadata"
import { StatusBadge } from "./StatusBadge"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"
import { complaintKeys } from "@/lib/hooks/useComplaints"
import { toast } from "sonner"
import { ComplaintStatus } from "@/lib/types/complaint-status.type"

interface ComplaintContentProps {
  complaint: Complaint
}

export function ComplaintContent({ complaint }: ComplaintContentProps) {
  const queryClient = useQueryClient()

  // Моковое обновление статуса (обновляем только кэш)
  const handleStatusChange = (newStatus: ComplaintStatus) => {
    queryClient.setQueryData(complaintKeys.detail(complaint.id.toString()), {
      ...complaint,
      status: newStatus,
    })
    toast.success("Статус обновлен")
  }

  // Моковое обновление меток
  const handleTagsChange = (newTags: string[]) => {
    queryClient.setQueryData(complaintKeys.detail(complaint.id.toString()), {
      ...complaint,
      tags: newTags,
    })
    toast.success("Метки обновлены")
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold">{complaint.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Выполняется приходит только во время работы
        </p>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="responsible">Ответственные</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная колонка */}
            <div className="lg:col-span-2 space-y-6">
              {/* Изображение проблемы */}
              <div className="border rounded-lg p-6 bg-muted/50 min-h-64 flex items-center justify-center">
                {complaint.url ? (
                  <img
                    src={complaint.url}
                    alt="Изображение проблемы"
                    className="max-w-full h-auto rounded"
                  />
                ) : (
                  <p className="text-muted-foreground">Product Image</p>
                )}
              </div>

              {/* Категория и Источник */}
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
                  <Badge variant="outline">{complaint.platform}</Badge>
                  {complaint.url && (
                    <a
                      href={complaint.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline block mt-2 truncate"
                    >
                      {complaint.url}
                    </a>
                  )}
                </div>
              </div>

              {/* Платформа источника */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Платформа источника
                </h3>
                <p className="text-sm">{complaint.platform}</p>
              </div>

              {/* Описание */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Описание
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Метаданные */}
            <div className="border rounded-lg p-6">
              <div className="space-y-6">
                {/* Статус (редактируемый) */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Статус
                  </h3>
                  <StatusBadge
                    status={complaint.status as ComplaintStatus}
                    editable={true}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                <ComplaintMetadata
                  complaint={complaint}
                  editable={true}
                  onTagsChange={handleTagsChange}
                />
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
