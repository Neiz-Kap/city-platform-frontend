"use client"

import { ComplaintContent } from "@/components/entities/complaint/ComplaintContent"
import { ComplaintDetailSkeleton } from "@/components/entities/complaint/ComplaintDetailSkeleton"
import { Button } from "@/components/ui/button"
import { useComplaint } from "@/lib/hooks/useComplaints"
import { ArrowLeft } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import { use } from "react"

interface Props {
  params: Promise<{
    complaintId: string
  }>
}

export default function ComplaintDetailPage({ params }: Props) {
  const { complaintId } = use(params)
  console.debug(`complaintId: ${complaintId}`)
  const router = useRouter()

  // useComplaint автоматически проверяет кэш и делает запрос на сервер
  const { data: complaint, isLoading, error } = useComplaint(complaintId)

  if (error) {
    notFound()
  }

  // Показываем skeleton только если данных нет в кэше
  if (isLoading && !complaint) {
    return <ComplaintDetailSkeleton />
  }

  // Если данные есть в кэше, показываем сразу (фоновое обновление идет параллельно)
  if (!complaint) {
    console.warn(`complaint not found: ${complaintId}`)
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>

      <ComplaintContent complaint={complaint} />
    </div>
  )
}
