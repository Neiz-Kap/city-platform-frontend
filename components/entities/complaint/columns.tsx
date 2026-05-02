"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { DashboardLabelPicker } from "@/components/entities/complaint/DashboardLabelPicker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/dataTableColumnHeader"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import { Complaint } from "@/lib/types/complaint.type"
import { ComplaintStatus } from "@/lib/types/complaint-status.type"
import { complaintPlatformLabelRu } from "@/lib/utils/complaint-platform-label"
import { formatRuDate } from "@/lib/utils/date-format"

import { StatusBadge } from "./StatusBadge"

export type ComplaintColumnHandlers = {
  allLabels: DashboardLabel[]
  onStatusChange: (complaintId: number, status: ComplaintStatus) => void
  onLabelIdsChange: (complaintId: number, labelIds: number[]) => void
  pendingComplaintId?: number | null
}

function labelContrastColor(hex: string): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return "#fff"

  let normalized = match[1]
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const value = Number.parseInt(normalized, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  const yiq = (red * 299 + green * 587 + blue * 114) / 1000

  return yiq >= 128 ? "#111" : "#fff"
}

export function createComplaintColumns(
  handlers: ComplaintColumnHandlers,
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
          className="block max-w-[400px] truncate"
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
        <div className="max-w-[400px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "platform",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Источник" />
      ),
      enableSorting: false,
      cell: ({ row }) => complaintPlatformLabelRu(row.original.platform),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => {
        const complaintId = row.original.id
        const busy = handlers.pendingComplaintId === complaintId

        return (
          <div className="min-w-[160px]">
            <StatusBadge
              status={row.original.status}
              editable={!busy}
              onStatusChange={(next) => handlers.onStatusChange(complaintId, next)}
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
        const busy = handlers.pendingComplaintId === complaint.id

        return (
          <div className="flex min-w-[220px] flex-wrap items-center gap-1">
            {(complaint.labels ?? []).map((label) => (
              <Badge
                key={label.id}
                className="border-0 text-xs"
                style={{
                  backgroundColor: label.color,
                  color: labelContrastColor(label.color),
                }}
              >
                {label.name}
              </Badge>
            ))}
            <DashboardLabelPicker
              align="start"
              disabled={busy}
              labels={handlers.allLabels}
              mode="icon"
              onChange={(labelIds) =>
                handlers.onLabelIdsChange(complaint.id, labelIds)
              }
              valueIds={(complaint.labels ?? []).map((label) => label.id)}
            />
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
      cell: ({ row }) => formatRuDate(row.original.createdAt),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата обновления" />
      ),
      cell: ({ row }) => formatRuDate(row.original.updatedAt),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
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
      ),
    },
  ]
}
