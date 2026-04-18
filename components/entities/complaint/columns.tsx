"use client"

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
import { DataTableColumnHeader } from "@/components/ui/dataTableColumnHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import { Complaint } from "@/lib/types/complaint.type"
import { ComplaintStatus } from "@/lib/types/complaint-status.type"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Tags } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "./StatusBadge"

export type ComplaintColumnHandlers = {
  allLabels: DashboardLabel[]
  onStatusChange: (complaintId: number, status: ComplaintStatus) => void
  onLabelIdsChange: (complaintId: number, labelIds: number[]) => void
  pendingComplaintId?: number | null
}

function labelContrastColor(hex: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return "#fff"
  let h = m[1]
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#111" : "#fff"
}

export function createComplaintColumns(
  h: ComplaintColumnHandlers,
): ColumnDef<Complaint>[] {
  return [
    {
      accessorKey: "id",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "name",
      header: "Название",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/complaint/${row.original.id}`}
          className="truncate max-w-[400px] block"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      enableSorting: false,
      cell: ({ row }) => (
        <div
          className="truncate max-w-[400px]"
          title={row.original.description}
        >
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Категория" />
      ),
    },
    {
      accessorKey: "platform",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Платформа" />
      ),
      enableSorting: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => {
        const id = row.original.id
        const busy = h.pendingComplaintId === id
        return (
          <div className="min-w-[160px]">
            <StatusBadge
              status={row.original.status}
              editable={!busy}
              onStatusChange={(next) => h.onStatusChange(id, next)}
            />
          </div>
        )
      },
    },
    {
      id: "label",
      accessorKey: "labels",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Метки" />
      ),
      enableSorting: true,
      cell: ({ row }) => {
        const complaint = row.original
        const selected = new Set((complaint.labels ?? []).map((l) => l.id))
        const busy = h.pendingComplaintId === complaint.id

        const toggle = (labelId: number) => {
          const next = new Set(selected)
          if (next.has(labelId)) next.delete(labelId)
          else next.add(labelId)
          h.onLabelIdsChange(complaint.id, [...next])
        }

        return (
          <div className="flex flex-wrap items-center gap-1 min-w-[200px]">
            {(complaint.labels ?? []).map((l) => (
              <Badge
                key={l.id}
                className="text-xs border-0"
                style={{
                  backgroundColor: l.color,
                  color: labelContrastColor(l.color),
                }}
              >
                {l.name}
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  disabled={busy}
                  aria-label="Изменить метки"
                >
                  <Tags className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Метка…" />
                  <CommandList>
                    <CommandEmpty>Нет меток</CommandEmpty>
                    <CommandGroup>
                      {h.allLabels.map((l) => (
                        <CommandItem
                          key={l.id}
                          value={l.name}
                          onSelect={() => toggle(l.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={selected.has(l.id)} />
                            <span
                              className="size-3 rounded-sm shrink-0 border"
                              style={{ backgroundColor: l.color }}
                            />
                            <span>{l.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Теги парсера" />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const tags = row.original.tags ?? []
        if (!tags.length) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата создания" />
      ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата обновления" />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/complaint/${row.original.id}`}>
                  Подробнее
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
