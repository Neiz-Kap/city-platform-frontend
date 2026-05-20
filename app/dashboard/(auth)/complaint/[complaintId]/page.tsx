"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"

import { ComplaintContent } from "@/components/entities/complaint/ComplaintContent"
import { ComplaintDetailSkeleton } from "@/components/entities/complaint/ComplaintDetailSkeleton"
import { Button } from "@/components/ui/button"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { useComplaint } from "@/lib/hooks/useComplaints"

export default function ComplaintDetailPage() {
  const { complaintId } = useParams<{ complaintId: string }>()
  const router = useRouter()
  const { data: complaint, error, isLoading, isRefetching, refetch } = useComplaint(complaintId)

  if (isLoading && !complaint) {
    return <ComplaintDetailSkeleton />
  }

  if (error instanceof ApiError && error.status === 404 && !complaint) {
    notFound()
  }

  if (error && !complaint) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back()
              return
            }

            router.push("/dashboard/complaint")
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          <p className="font-medium">Не удалось открыть карточку предложения.</p>
          <p className="mt-2 text-destructive/80">
            {getErrorMessage(error, "Попробуйте обновить страницу или повторить попытку позже.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => void refetch()} disabled={isRefetching}>
              {isRefetching ? "Повторяем запрос…" : "Повторить"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/complaint">К списку предложений</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back()
            return
          }

          router.push("/dashboard/complaint")
        }}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>

      <ComplaintContent complaint={complaint} />
    </div>
  )
}
