"use client"

import { Spinner } from "@/components/ui/spinner"
import { useComplaints } from "@/lib/hooks/useComplaints"
import { ComplaintQueryParams } from "@/lib/types/complaint.type"
import { SortingState } from "@tanstack/react-table"
import { useCallback, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function ComplaintPage() {
  const [pagination, setPagination] = useState({ page: 1, per_page: 3 })
  const [filters, setFilters] = useState<
    Pick<ComplaintQueryParams, "category" | "status">
  >({})
  const [search, setSearch] = useState<string>("")

  const queryParams: ComplaintQueryParams = {
    page: pagination.page,
    per_page: pagination.per_page,
    ...filters,
    ...(search && { search }),
  }

  const { data, isLoading, error } = useComplaints(queryParams)

  const handlePaginationChange = useCallback(
    (newPagination: { page: number; per_page: number }) => {
      setPagination(newPagination)
    },
    [],
  )

  const handleSortChange = useCallback((sorting: SortingState) => {
    // For now, we'll just log the sorting since it's not fully implemented
    console.log("Sorting changed:", sorting)
    // You can implement actual sorting by updating queryParams
  }, [])

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch)
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleFilterChange = useCallback(
    (newFilters: { category?: string[]; status?: string[] }) => {
      setFilters(newFilters)
      // Reset to first page when filtering
      setPagination((prev) => ({ ...prev, page: 1 }))
    },
    [],
  )

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500 text-center">
          Ошибка загрузки жалоб: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      {data ? (
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      ) : (
        <Spinner />
      )}
    </div>
  )
}
