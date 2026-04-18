export enum ComplaintStatus {
  BACKLOG = "backlog",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.BACKLOG]: "Беклог",
  [ComplaintStatus.IN_PROGRESS]: "В процессе",
  [ComplaintStatus.DONE]: "Завершено",
}

export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.BACKLOG]: "bg-gray-500",
  [ComplaintStatus.IN_PROGRESS]: "bg-blue-500",
  [ComplaintStatus.DONE]: "bg-green-500",
}

/** Легаси-значения с бэкенда / старых данных */
const STATUS_ALIASES: Record<string, ComplaintStatus> = {
  completed: ComplaintStatus.DONE,
  done: ComplaintStatus.DONE,
  backlog: ComplaintStatus.BACKLOG,
  in_progress: ComplaintStatus.IN_PROGRESS,
}

export function parseComplaintStatus(raw: string): ComplaintStatus | null {
  if (Object.values(ComplaintStatus).includes(raw as ComplaintStatus)) {
    return raw as ComplaintStatus
  }
  return STATUS_ALIASES[raw] ?? null
}

export function getStatusLabelRu(status: string): string {
  const parsed = parseComplaintStatus(status)
  if (parsed) return COMPLAINT_STATUS_LABELS[parsed]
  return status
}
