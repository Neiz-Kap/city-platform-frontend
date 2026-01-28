export enum ComplaintStatus {
  BACKLOG = "backlog",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.BACKLOG]: "Беклог",
  [ComplaintStatus.IN_PROGRESS]: "В процессе",
  [ComplaintStatus.COMPLETED]: "Завершено",
}

export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.BACKLOG]: "bg-gray-500",
  [ComplaintStatus.IN_PROGRESS]: "bg-blue-500",
  [ComplaintStatus.COMPLETED]: "bg-green-500",
}
