"use client"

/**
 * PDF-отчёт по обращениям за период. При появлении авторизации ограничьте
 * доступ к `/dashboard/report` через middleware (только авторизованные).
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComplaintAPI } from "@/lib/api/complaint.api"
import { registerReportFonts } from "@/lib/pdf/register-report-fonts"
import { fetchComplaintsReportData } from "@/lib/utils/complaint-report-data"
import { format, parseISO, subDays } from "date-fns"
import { ru } from "date-fns/locale"
import { FileDown, Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

function toStartOfDayIso(d: string) {
  return `${d}T00:00:00`
}

function toEndOfDayIso(d: string) {
  return `${d}T23:59:59`
}

function formatPeriodRu(startYmd: string, endYmd: string) {
  const a = parseISO(startYmd)
  const b = parseISO(endYmd)
  return `${format(a, "d MMMM yyyy", { locale: ru })} — ${format(b, "d MMMM yyyy", { locale: ru })}`
}

export default function ReportPage() {
  const [startDate, setStartDate] = useState(() =>
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  )
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ page: number; pages: number } | null>(
    null,
  )

  const periodPreview = useMemo(
    () => formatPeriodRu(startDate, endDate),
    [startDate, endDate],
  )

  const [previewTotal, setPreviewTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) {
      setPreviewTotal(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const res = await ComplaintAPI.getByDateRange({
          start_date: toStartOfDayIso(startDate),
          end_date: toEndOfDayIso(endDate),
          page: 1,
          per_page: 1,
          sort_by: "createdAt",
          sort_order: "DESC",
        })
        if (!cancelled) setPreviewTotal(res.pagination.total)
      } catch {
        if (!cancelled) setPreviewTotal(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  const handleDownload = useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("Укажите даты начала и окончания периода")
      return
    }
    if (startDate > endDate) {
      toast.error("Дата начала не может быть позже даты окончания")
      return
    }

    const start_date = toStartOfDayIso(startDate)
    const end_date = toEndOfDayIso(endDate)
    const reportShortId = crypto.randomUUID().replace(/-/g, "").slice(0, 8)

    setLoading(true)
    setProgress(null)
    try {
      const { tableRows, total, aggregates } = await fetchComplaintsReportData(
        { start_date, end_date },
        ({ page, pages }) => setProgress({ page, pages }),
      )
      const origin = window.location.origin
      await registerReportFonts(origin)

      const [{ pdf }, { ComplaintsAdminReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/ComplaintsAdminReportDocument"),
      ])

      const periodLabel = formatPeriodRu(startDate, endDate)
      const generatedAt = new Date().toLocaleString("ru-RU")

      const blob = await pdf(
        <ComplaintsAdminReportDocument
          origin={origin}
          periodLabel={periodLabel}
          reportShortId={reportShortId}
          generatedAt={generatedAt}
          tableRows={tableRows}
          total={total}
          aggregates={aggregates}
        />,
      ).toBlob()

      const filename = `ODS_report_${startDate}_${endDate}_${reportShortId}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.rel = "noopener"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.success("PDF сформирован")
    } catch (e) {
      console.error(e)
      toast.error("Не удалось сформировать PDF", {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }, [startDate, endDate])

  return (
    <section className="w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Отчёт PDF</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Сводка за выбранный период и таблица обращений (до 100 строк). Данные
          загружаются через API списка по датам; сводка по статусам и каналам
          считается по всем записям периода.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="report-start">Дата начала</Label>
          <Input
            id="report-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-end">Дата окончания</Label>
          <Input
            id="report-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <p className="text-muted-foreground text-sm">Период: {periodPreview}</p>

      {previewTotal != null && previewTotal > 100 ? (
        <Alert>
          <AlertTitle>Часть строк только в таблице PDF</AlertTitle>
          <AlertDescription>
            За период найдено {previewTotal} обращений. В PDF-таблице будут
            первые 100 (по дате создания, новые сверху). Сводные показатели в
            PDF посчитаны по всем {previewTotal} записям.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="text-white hover:text-white [&_svg]:text-white"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          <span className="ml-2">Скачать PDF</span>
        </Button>
        {loading && progress ? (
          <span className="text-muted-foreground text-sm">
            Загрузка данных: страница {progress.page} из {progress.pages}…
          </span>
        ) : null}
      </div>
    </section>
  )
}
