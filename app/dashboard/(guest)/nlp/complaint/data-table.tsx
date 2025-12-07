"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginatedData } from "@/lib/types"
import { ChevronDown, PlusCircle } from "lucide-react"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PaginatedData<TData>
  onPaginationChange: (pagination: { page: number; per_page: number }) => void
  onSortChange?: (sorting: SortingState) => void
  onSearchChange?: (search: string) => void
  onFilterChange?: (filters: { category?: string[]; status?: string[] }) => void
  pagination: {
    page: number
    per_page: number
  }
  isLoading?: boolean
}

// Mock categories and statuses for filters (replace with actual data from API)
const categories = [
  { label: "Infrastructure", value: "infrastructure" },
  { label: "Environment", value: "environment" },
  { label: "Safety", value: "safety" },
]

const statuses = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
]

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    columns,
    data: paginatedData,
    onPaginationChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    pagination,
    isLoading = false,
  } = props
  const { data, pagination: serverPagination } = paginatedData

  const [sorting, setSorting] = useState<SortingState>([]) // TODO: { id: 'status', desc: false }
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [search, setSearch] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(serverPagination.total / serverPagination.per_page),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: serverPagination.page - 1, // Convert to 0-based index
        pageSize: serverPagination.per_page,
      },
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater
      setSorting(newSorting)
      onSortChange?.(newSorting)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  })

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange?.(value)
  }

  // Handle category filter change
  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories)
    onFilterChange?.({ category: categories, status: selectedStatuses })
  }

  // Handle status filter change
  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
    onFilterChange?.({ category: selectedCategories, status: statuses })
  }

  // Handle pagination
  const handlePreviousPage = () => {
    if (serverPagination.page > 1) {
      onPaginationChange({
        page: serverPagination.page - 1,
        per_page: serverPagination.per_page,
      })
    }
  }

  const handleNextPage = () => {
    if (serverPagination.page < serverPagination.pages) {
      onPaginationChange({
        page: serverPagination.page + 1,
        per_page: serverPagination.per_page,
      })
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по жалобам..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="max-w-sm"
          />

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="me-2 h-4 w-4" />
                Категории
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0">
              <Command>
                <CommandInput placeholder="Категория" className="h-9" />
                <CommandList>
                  <CommandEmpty>Категории не найдены.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.value}
                        value={category.value}
                        onSelect={(value) => {
                          const newCategories = selectedCategories.includes(
                            value,
                          )
                            ? selectedCategories.filter((c) => c !== value)
                            : [...selectedCategories, value]
                          handleCategoryChange(newCategories)
                        }}
                      >
                        <div className="flex items-center space-x-3 py-1">
                          <Checkbox
                            id={`category-${category.value}`}
                            checked={selectedCategories.includes(
                              category.value,
                            )}
                          />
                          <label
                            htmlFor={`category-${category.value}`}
                            className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.label}
                          </label>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="me-2 h-4 w-4" />
                Статусы
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0">
              <Command>
                <CommandInput placeholder="Статус" className="h-9" />
                <CommandList>
                  <CommandEmpty>Статусы не найдены.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem
                        key={status.value}
                        value={status.value}
                        onSelect={(value) => {
                          const newStatuses = selectedStatuses.includes(value)
                            ? selectedStatuses.filter((s) => s !== value)
                            : [...selectedStatuses, value]
                          handleStatusChange(newStatuses)
                        }}
                      >
                        <div className="flex items-center space-x-3 py-1">
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={selectedStatuses.includes(status.value)}
                          />
                          <label
                            htmlFor={`status-${status.value}`}
                            className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status.label}
                          </label>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Колонки <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Жалобы не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Показано {data.length} из {serverPagination.total} жалоб
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={serverPagination.page <= 1 || isLoading}
          >
            Назад
          </Button>
          <div className="text-sm">
            Страница {serverPagination.page} из {serverPagination.pages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={
              serverPagination.page >= serverPagination.pages || isLoading
            }
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  )
}
