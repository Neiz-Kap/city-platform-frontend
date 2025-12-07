export interface PaginationInfo {
  page: number
  pages: number
  per_page: number
  total: number
}

export interface PaginatedData<TData> {
  data: TData[]

  pagination: PaginationInfo
}
