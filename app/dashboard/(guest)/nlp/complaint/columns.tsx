"use client"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/dataTableColumnHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Complaint } from "@/lib/types/complaint.type"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

export const columns: ColumnDef<Complaint>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => row.getValue("id"),
  },
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "description",
    header: "Описание",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Категория" />
    ),
    cell: ({ row }) => row.getValue("category"),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Статус" />
    ),
    cell: ({ row }) => row.getValue("status"),
  },
  {
    accessorKey: "platform",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Платформа источник" />
    ),
    cell: ({ row }) => row.getValue("platform"),
  },
  // TODO: implement tags
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Метки" />
    ),
    cell: ({ row }) => {
      row.getValue("tags")
    },
    // cell: ({ row }) =>
    //   (row.getValue("tags") as Complaint["tags"]).map((tag) => {
    //     return <Badge variant="secondary">{tag}</Badge>
    //   }),
    // accessorFn: (row) => (
    //   <>
    //     {row.tags.map((tag) => {
    //       return <Badge variant="secondary">{tag}</Badge>
    //     })}
    //   </>
    // ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Дата создания" />
    ),
    cell: ({ row }) => row.getValue("createdAt"),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Дата обновления" />
    ),
    cell: ({ row }) => row.getValue("updatedAt"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className={"flex flex-col"}>
              <Button variant={"ghost"}>Подробнее</Button>
              <Button variant={"ghost"}>Перенаправить</Button>{" "}
              <DropdownMenuSeparator />
              <Button variant={"destructive"}>Удалить</Button>
              {/*<Suspense fallback={<Spinner />}>
                <OrganizationDialog organization={row.original}>
                  <Button variant={"ghost"}>View organization</Button>
                </OrganizationDialog>
              </Suspense>*/}
              {/*<Suspense fallback={<Spinner />}>
                <OrganizationConfirmDeletionDialog id={row.original._id}>
                  <Button variant={"ghost"}>Delete</Button>
                </OrganizationConfirmDeletionDialog>
              </Suspense>*/}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
