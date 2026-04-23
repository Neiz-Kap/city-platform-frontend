import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer"
import { format, isValid, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { PdfFooter } from "@/components/pdf/PdfFooter"
import { PdfMetadata } from "@/components/pdf/PdfMetadata"
import { PdfTable } from "@/components/pdf/PdfTable"
import { commonStyles } from "@/components/pdf/styles"
import type { Complaint } from "@/lib/types/complaint.type"
import { getStatusLabelRu } from "@/lib/types/complaint-status.type"
import type { ReportPeriodAggregates } from "@/lib/utils/complaint-report-data"
import { REPORT_TABLE_LIMIT } from "@/lib/utils/complaint-report-data"
import { complaintPlatformLabelRu } from "@/lib/utils/complaint-platform-label"

export type ComplaintsAdminReportDocumentProps = {
  origin: string
  periodLabel: string
  reportShortId: string
  generatedAt: string
  tableRows: Complaint[]
  total: number
  aggregates: ReportPeriodAggregates
}

const NAME_MAX_LEN = 56

type StatusCardData = {
  key: string
  label: string
  count: number
}

function pctOf(total: number, n: number): number {
  if (total <= 0) return 0
  return Math.round((n / total) * 100)
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

/**
 * Карточки: три основных статуса (done + completed), прочие ключи API,
 * «Без статуса» для пустого ключа, при расхождении total vs сумма — отдельный блок.
 */
function buildStatusCards(aggregates: ReportPeriodAggregates): StatusCardData[] {
  const raw = aggregates.counts_by_status
  const total = aggregates.total
  const cards: StatusCardData[] = []

  const backlog = raw.backlog ?? 0
  const inProg = raw.in_progress ?? 0
  const done = (raw.done ?? 0) + (raw.completed ?? 0)

  cards.push({
    key: "backlog",
    label: getStatusLabelRu("backlog"),
    count: backlog,
  })
  cards.push({
    key: "in_progress",
    label: getStatusLabelRu("in_progress"),
    count: inProg,
  })
  cards.push({
    key: "done",
    label: getStatusLabelRu("done"),
    count: done,
  })

  const skip = new Set(["backlog", "in_progress", "done", "completed"])

  const othersSorted = Object.entries(raw)
    .filter(([k, n]) => !skip.has(k) && n > 0)
    .sort(([a], [b]) => a.localeCompare(b))

  for (const [key, n] of othersSorted) {
    const trimmed = key.trim()
    const label = trimmed === "" ? "Без статуса" : getStatusLabelRu(key)
    cards.push({
      key: trimmed === "" ? "__empty__" : key,
      label,
      count: n,
    })
  }

  const sumStatuses = Object.values(raw).reduce((a, b) => a + b, 0)
  const residual = total - sumStatuses
  if (residual > 0) {
    cards.push({
      key: "__residual__",
      label: "Расхождение с суммой статусов",
      count: residual,
    })
  }

  return cards
}

function formatReportDate(iso: string): string {
  try {
    const d = parseISO(iso)
    if (!isValid(d)) return iso
    return format(d, "dd.MM.yyyy HH:mm", { locale: ru })
  } catch {
    return iso
  }
}

function truncateName(name: string): string {
  const t = name.trim()
  if (t.length <= NAME_MAX_LEN) return t || "—"
  return `${t.slice(0, NAME_MAX_LEN - 1)}…`
}

function platformCompact(aggregates: ReportPeriodAggregates): string {
  const short = (p: string) => {
    if (p === "vk") return "ВК"
    if (p === "email") return "Почта"
    if (p === "telegram_bot") return "TG"
    return p
  }
  return Object.entries(aggregates.counts_by_platform)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${short(p)} ${n}`)
    .join(" · ") || "—"
}

function labelsChipText(
  label_counts: Record<string, number>,
  maxLen: number,
): string {
  const entries = Object.entries(label_counts).sort((a, b) => b[1] - a[1])
  const top = entries.slice(0, 4)
  if (top.length === 0) return "—"
  const s = top.map(([name, n]) => `${name.slice(0, 12)}${name.length > 12 ? "…" : ""}:${n}`).join(" · ")
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s
}

/** Разные фоны и рамки для читаемости блоков KPI */
const KPI_CHIP_PALETTES = [
  { bg: "#dbeafe", border: "#2563eb", color: "#1e3a8a" },
  { bg: "#d1fae5", border: "#059669", color: "#064e3b" },
  { bg: "#ffedd5", border: "#ea580c", color: "#7c2d12" },
  { bg: "#e9d5ff", border: "#7c3aed", color: "#4c1d95" },
  { bg: "#fce7f3", border: "#db2777", color: "#831843" },
] as const

function KpiChip({
  line,
  paletteIndex,
  isFirst,
  isLast,
}: {
  line: string
  paletteIndex: number
  isFirst?: boolean
  isLast?: boolean
}) {
  const p =
    KPI_CHIP_PALETTES[paletteIndex % KPI_CHIP_PALETTES.length] ??
    KPI_CHIP_PALETTES[0]

  return (
    <View
      style={[
        commonStyles.kpiChip,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
        },
        isFirst ? { marginLeft: 0 } : {},
        isLast ? { marginRight: 0 } : {},
      ]}
    >
      <Text style={[commonStyles.kpiChipText, { color: p.color }]}>{line}</Text>
    </View>
  )
}

function StatusBreakdownCard({
  data,
  total,
  paletteIndex,
  isLastInRow,
}: {
  data: StatusCardData
  total: number
  paletteIndex: number
  isLastInRow?: boolean
}) {
  const p =
    KPI_CHIP_PALETTES[paletteIndex % KPI_CHIP_PALETTES.length] ??
    KPI_CHIP_PALETTES[0]
  const pct = pctOf(total, data.count)

  return (
    <View
      style={[
        commonStyles.statusCard,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          marginRight: isLastInRow ? 0 : "2.5%",
        },
      ]}
    >
      <Text style={[commonStyles.statusCardTitle, { color: p.color }]}>
        {data.label}
      </Text>
      <Text style={[commonStyles.statusCardMetric, { color: p.color }]}>
        {pct}%
      </Text>
      <Text style={commonStyles.statusCardAbs}>
        Абсолютное: {data.count} из {total}
      </Text>
    </View>
  )
}

export function ComplaintsAdminReportDocument({
  origin,
  periodLabel,
  reportShortId,
  generatedAt,
  tableRows,
  total,
  aggregates,
}: ComplaintsAdminReportDocumentProps) {
  const logoSrc = `${origin.replace(/\/$/, "")}/ods_logo.svg`
  const doneCount =
    (aggregates.counts_by_status.done ?? 0) +
    (aggregates.counts_by_status.completed ?? 0)
  const donePct =
    aggregates.total > 0
      ? Math.round((doneCount / aggregates.total) * 100)
      : 0

  const rows =
    tableRows.length > 0
      ? tableRows.map((c) => [
          complaintPlatformLabelRu(c.platform),
          truncateName(c.name ?? ""),
          getStatusLabelRu(c.status),
          c.labels?.length ? c.labels.map((l) => l.name).join(", ") : "—",
          formatReportDate(c.createdAt),
          formatReportDate(c.updatedAt),
        ])
      : [["—", "—", "—", "—", "—", "—"]]

  return (
    <Document
      title={`ODS Platform — отчёт ${reportShortId}`}
      language="ru-RU"
    >
      <Page size="A4" style={commonStyles.page}>
        <View style={commonStyles.brandRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={{ width: 88, height: 28 }} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={commonStyles.brandTitle}>ODS Platform</Text>
            <Text style={commonStyles.brandSubtitle}>
              Отчёт по обращениям граждан · № {reportShortId}
            </Text>
          </View>
        </View>

        <PdfMetadata period={periodLabel} periodLabel="Период" />

        <Text style={commonStyles.sectionTitle}>Сводка за период</Text>
        <View style={commonStyles.kpiStrip}>
          <KpiChip
            isFirst
            paletteIndex={0}
            line={`Всего · ${aggregates.total}`}
          />
          <KpiChip
            paletteIndex={1}
            line={`Завершено · ${donePct}% (${doneCount})`}
          />
          <KpiChip
            paletteIndex={2}
            line={`Каналы · ${platformCompact(aggregates)}`}
          />
          <KpiChip
            isLast
            paletteIndex={3}
            line={`Метки · ${labelsChipText(aggregates.label_counts, 48)}`}
          />
        </View>

        <Text style={commonStyles.subsectionTitle}>По статусам</Text>
        {chunk(buildStatusCards(aggregates), 3).map((row, ri) => (
          <View key={`status-row-${ri}`} style={commonStyles.statusGridRow}>
            {row.map((card, ci) => (
              <StatusBreakdownCard
                key={card.key}
                data={card}
                total={aggregates.total}
                paletteIndex={ri * 3 + ci}
                isLastInRow={ci === row.length - 1}
              />
            ))}
          </View>
        ))}

        {total > REPORT_TABLE_LIMIT ? (
          <Text style={commonStyles.warning}>
            В таблице показаны первые {REPORT_TABLE_LIMIT} записей (сортировка:
            дата создания, по убыванию). Всего в периоде: {total}. Сводка
            посчитана по всем записям периода.
          </Text>
        ) : null}

        <Text style={commonStyles.sectionTitle}>
          Таблица обращений (до {REPORT_TABLE_LIMIT} строк)
        </Text>
        <PdfTable
          columns={[
            { header: "Платформа", flex: 0.85, cellBold: true },
            { header: "Название", flex: 1.35 },
            { header: "Статус", flex: 0.75 },
            { header: "Метки", flex: 1.05 },
            { header: "Дата создания", flex: 0.95 },
            { header: "Дата обновления", flex: 0.95 },
          ]}
          rows={rows}
        />

        <PdfFooter timestamp={generatedAt} />
      </Page>
    </Document>
  )
}
