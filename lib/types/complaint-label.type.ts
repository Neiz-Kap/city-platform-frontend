/** Метка дашборда (GET /labels, вложена в жалобу как `labels`). */
export interface DashboardLabel {
  id: number
  name: string
  color: string
  complaint_count?: number
  userId: number
}

export interface CreateLabelRequest {
  name: string
  color?: string
}

export interface UpdateLabelRequest {
  name?: string
  color?: string
}
