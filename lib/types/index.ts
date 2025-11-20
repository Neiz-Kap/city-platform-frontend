export interface PaginatedData<TData> {
  data: TData[];

  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
  };
}
