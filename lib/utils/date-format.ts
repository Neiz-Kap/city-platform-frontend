import { format, isValid, parse, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

function parseDate(value: string) {
  const parsed = parseISO(value)
  if (isValid(parsed)) return parsed

  const fallback = new Date(value)
  return isValid(fallback) ? fallback : null
}

export function formatRuDate(value?: string | null, fallback = "—") {
  if (!value) return fallback
  const date = parseDate(value)
  if (!date) return fallback
  return format(date, "dd.MM.yyyy", { locale: ru })
}

export function formatRuLongDate(value?: string | null, fallback = "—") {
  if (!value) return fallback
  const date = parseDate(value)
  if (!date) return fallback
  return format(date, "d MMMM yyyy 'г.'", { locale: ru })
}

export function parseRuInputDate(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = parse(trimmed, "dd.MM.yyyy", new Date())
  return isValid(parsed) ? parsed : null
}

export function formatIsoDateForInput(value?: string | null) {
  if (!value) return ""
  const date = parseDate(value)
  if (!date) return ""
  return format(date, "dd.MM.yyyy", { locale: ru })
}

export function formatDateToIso(value: Date) {
  return format(value, "yyyy-MM-dd")
}
