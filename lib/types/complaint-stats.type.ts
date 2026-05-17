export type TimePeriod = "day" | "week" | "month"

export interface StatItem {
  key: string
  value: number
}

export interface StatsQueryParams {
  period: TimePeriod
  page: number
  per_page: number
}
