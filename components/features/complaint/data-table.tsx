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
import { PlusCircle, RotateCcw, SearchX } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"

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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DEFAULT_PAGINATED_DATA } from "@/lib/mock-data/complaint.data"
import { PaginatedData } from "@/lib/types"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import type { LabelMatchMode } from "@/lib/types/complaint.type"

export type DashboardTableFilters = {
  endDate: string
  excludeLabelIds: number[]
  labelIds: number[]
  labelMatch: LabelMatchMode
  selectedStatuses: string[]
  startDate: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  dashboardFilters: DashboardTableFilters
  data: PaginatedData<TData>
  filterLabels: DashboardLabel[]
  initialSorting?: SortingState
  isLoading?: boolean
  onDashboardFiltersChange: (patch: Partial<DashboardTableFilters>) => void
  onPaginationChange: (pagination: { page: number; per_page: number }) => void
  onResetFilters?: () => void
  onSearchQueryChange: (search: string) => void
  onSortChange?: (sorting: SortingState) => void
  pagination: {
    page: number
    per_page: number
  }
  searchQuery: string
  sorting?: SortingState
  validationMessage?: string | null
}

const COLUMN_LABELS: Record<string, string> = {
  actions: "Действия",
  createdAt: "Дата создания",
  description: "Описание",
  id: "№",
  label: "Метки",
  name: "Название",
  platform: "Источник",
  status: "Статус",
  updatedAt: "Дата обновления",
}

function FieldShell({
  children,
  label,
  wide,
}: {
  children: ReactNode
  label?: string
  wide?: boolean
}) {
  return (
    <div
      className={
        wide
          ? "flex min-w-[260px] flex-1 flex-col justify-end gap-1"
          : "flex flex-col justify-end gap-1"
      }
    >
      {label ? (
        <Label className="text-xs text-muted-foreground">{label}</Label>
      ) : (
        <div className="h-4" aria-hidden="true" />
      )}
      {children}
    </div>
  )
}

function columnLabel(columnId: string) {
  return COLUMN_LABELS[columnId] ?? columnId
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    columns,
    data: paginatedData = DEFAULT_PAGINATED_DATA,
    onPaginationChange,
    onSortChange,
    onResetFilters,
    searchQuery,
    onSearchQueryChange,
    filterLabels,
    dashboardFilters,
    onDashboardFiltersChange,
    pagination,
    isLoading = false,
    initialSorting = [{ id: "createdAt", desc: true }],
    sorting: controlledSorting,
    validationMessage,
  } = props
  const { data, pagination: serverPagination } = paginatedData

  const [sorting, setSorting] = useState<SortingState>(
    controlledSorting ?? initialSorting,
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    selectedStatuses,
    labelIds,
    labelMatch,
    excludeLabelIds,
    startDate,
    endDate,
  } = dashboardFilters

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedStatuses.length > 0 ||
    labelIds.length > 0 ||
    excludeLabelIds.length > 0 ||
    startDate.length > 0 ||
    endDate.length > 0 ||
    labelMatch === "all"

  useEffect(() => {
    if (!controlledSorting) return

    const current = JSON.stringify(sorting)
    const next = JSON.stringify(controlledSorting)
    if (current !== next) {
      setSorting(controlledSorting)
    }
  }, [controlledSorting, sorting])


  const setIncludeLabels = (next: number[]) =>
    onDashboardFiltersChange({ labelIds: next })

  const setExcludeLabels = (next: number[]) =>
    onDashboardFiltersChange({ excludeLabelIds: next })

  const handleStartDateChange = (value: string) => {
    if (endDate && value && value > endDate) {
      onDashboardFiltersChange({ endDate: value, startDate: value })
      return
    }

    onDashboardFiltersChange({ startDate: value })
  }

  const handleEndDateChange = (value: string) => {
    if (startDate && value && value < startDate) {
      return
    }

    onDashboardFiltersChange({ endDate: value })
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater
      setSorting(nextSorting)
      onSortChange?.(nextSorting)
    },
    pageCount: Math.ceil(serverPagination.total / serverPagination.per_page),
    state: {
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: serverPagination.page - 1,
        pageSize: serverPagination.per_page,
      },
      sorting,
    },
  })

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

  const toggleInList = <T,>(list: T[], item: T, eq: (a: T, b: T) => boolean) =>
    list.some((value) => eq(value, item))
      ? list.filter((value) => !eq(value, item))
      : [...list, item]

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 py-4">
        <div className="flex flex-wrap items-end gap-2">
          <FieldShell wide>
            <Input
              placeholder="Поиск по жалобам..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="h-9 max-w-sm"
            />
          </FieldShell>

          <FieldShell>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <PlusCircle className="me-2 h-4 w-4" />
                  Метки (включить)
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Метка" className="h-9" />
                  <CommandList>
                    <CommandEmpty>Нет меток</CommandEmpty>
                    <CommandGroup>
                      {filterLabels.map((label) => (
                        <CommandItem
                          key={label.id}
                          value={label.name}
                          onSelect={() => {
                            setIncludeLabels(
                              toggleInList(labelIds, label.id, (a, b) => a === b),
                            )
                          }}
                        >
                          <div className="flex items-center space-x-3 py-1">
                            <Checkbox
                              id={`flt-lbl-${label.id}`}
                              checked={labelIds.includes(label.id)}
                            />
                            <span
                              className="size-3 shrink-0 rounded-sm border"
                              style={{ backgroundColor: label.color }}
                            />
                            <label htmlFor={`flt-lbl-${label.id}`} className="leading-none">
                              {label.name}
                            </label>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FieldShell>

          <FieldShell label="Совпадение меток">
            <Select
              value={labelMatch}
              onValueChange={(value) =>
                onDashboardFiltersChange({
                  labelMatch: value as LabelMatchMode,
                })
              }
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любая из</SelectItem>
                <SelectItem value="all">Все выбранные</SelectItem>
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <PlusCircle className="me-2 h-4 w-4" />
                  Скрыть метки
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Метка" className="h-9" />
                  <CommandList>
                    <CommandEmpty>Нет меток</CommandEmpty>
                    <CommandGroup>
                      {filterLabels.map((label) => (
                        <CommandItem
                          key={`ex-${label.id}`}
                          value={`ex-${label.name}`}
                          onSelect={() => {
                            setExcludeLabels(
                              toggleInList(
                                excludeLabelIds,
                                label.id,
                                (a, b) => a === b,
                              ),
                            )
                          }}
                        >
                          <div className="flex items-center space-x-3 py-1">
                            <Checkbox
                              id={`flt-ex-${label.id}`}
                              checked={excludeLabelIds.includes(label.id)}
                            />
                            <span
                              className="size-3 shrink-0 rounded-sm border"
                              style={{ backgroundColor: label.color }}
                            />
                            <label htmlFor={`flt-ex-${label.id}`} className="leading-none">
                              {label.name}
                            </label>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FieldShell>

          <FieldShell label="С даты">
            <Input
              type="date"
              className="h-9 w-40"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => handleStartDateChange(event.target.value)}
            />
          </FieldShell>

          <FieldShell label="По дату">
            <Input
              type="date"
              className="h-9 w-40"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => handleEndDateChange(event.target.value)}
            />
          </FieldShell>
        </div>

        {validationMessage && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            {validationMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Фильтры применены к текущей выборке"
              : "Показываем все жалобы без дополнительных фильтров"}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && onResetFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Сбросить фильтры
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Колонки
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                    >
                      {columnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-md border shadow-2xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Загрузка жалоб...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center">
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <SearchX className="h-5 w-5" />
                    <span>
                      {hasActiveFilters
                        ? "По текущим фильтрам жалобы не найдены."
                        : "Жалобы пока не появились."}
                    </span>
                    {hasActiveFilters && onResetFilters && (
                      <Button variant="outline" size="sm" onClick={onResetFilters}>
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Показано {data.length} из {serverPagination.total} жалоб · страница {pagination.page}
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
            disabled={serverPagination.page >= serverPagination.pages || isLoading}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </div>
  )
}
