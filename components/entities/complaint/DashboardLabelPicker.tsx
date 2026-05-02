"use client"

import { useMemo, useState } from "react"
import { Plus, Tags } from "lucide-react"
import { toast } from "sonner"

import { MAX_LABELS_PER_ACCOUNT } from "@/lib/api/labels.api"
import { getErrorMessage } from "@/lib/api/errors"
import { useCreateLabel, useLabels } from "@/lib/hooks/useLabels"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DEFAULT_COLOR = "#6B7280"

type Props = {
  align?: "center" | "end" | "start"
  disabled?: boolean
  labels?: DashboardLabel[]
  mode?: "button" | "icon"
  onChange: (labelIds: number[]) => void
  valueIds: number[]
}

function normalizeLabelName(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU")
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

export function DashboardLabelPicker({
  align = "start",
  disabled,
  labels,
  mode = "button",
  onChange,
  valueIds,
}: Props) {
  const { data: queryLabels = [], isLoading } = useLabels()
  const createLabel = useCreateLabel()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const allLabels = labels ?? queryLabels
  const selectedIds = useMemo(() => new Set(valueIds), [valueIds])
  const selectedLabels = useMemo(
    () => allLabels.filter((label) => selectedIds.has(label.id)),
    [allLabels, selectedIds],
  )

  const normalizedSearch = normalizeLabelName(search)
  const hasMatchingLabel = allLabels.some(
    (label) => normalizeLabelName(label.name) === normalizedSearch,
  )
  const canCreate =
    normalizedSearch.length > 0 &&
    !hasMatchingLabel &&
    allLabels.length < MAX_LABELS_PER_ACCOUNT

  const toggleLabel = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  const handleCreate = () => {
    const name = search.trim()
    if (!name) return

    createLabel.mutate(
      { name, color: DEFAULT_COLOR },
      {
        onError: (error) => {
          toast.error(getErrorMessage(error, "Не удалось создать метку"))
        },
        onSuccess: (created) => {
          const createdId = typeof created.id === "number" ? created.id : null
          if (createdId != null) {
            onChange([...new Set([...valueIds, createdId])])
          }
          toast.success(`Метка «${name}» создана`)
          setSearch("")
          setOpen(false)
        },
      },
    )
  }

  return (
    <div className="space-y-3">
      {mode === "button" && selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <Badge
              key={label.id}
              className="border-0"
              style={{
                backgroundColor: label.color,
                color: labelContrastColor(label.color),
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {mode === "icon" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              disabled={disabled}
              aria-label="Управлять метками"
            >
              <Tags className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between",
                disabled && "cursor-not-allowed",
              )}
              disabled={disabled}
            >
              <span className="truncate">
                {selectedLabels.length > 0
                  ? `Выбрано меток: ${selectedLabels.length}`
                  : "Выберите или создайте метки"}
              </span>
              <Tags className="h-4 w-4" />
            </Button>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0" align={align}>
          <Command shouldFilter>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Найти метку..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                <div className="space-y-3 px-3 py-1 text-sm">
                  <p className="text-muted-foreground">
                    {search.trim()
                      ? "Совпадений не найдено."
                      : "Метки пока не созданы."}
                  </p>
                  {canCreate ? (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={handleCreate}
                      disabled={createLabel.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      Создать метку «{search.trim()}»
                    </Button>
                  ) : search.trim() ? (
                    <p className="text-xs text-muted-foreground">
                      {allLabels.length >= MAX_LABELS_PER_ACCOUNT
                        ? `Достигнут лимит меток (${MAX_LABELS_PER_ACCOUNT}).`
                        : "Измените запрос или выберите существующую метку."}
                    </p>
                  ) : null}
                </div>
              </CommandEmpty>

              <CommandGroup>
                {allLabels.map((label) => (
                  <CommandItem
                    key={label.id}
                    value={label.name}
                    onSelect={() => toggleLabel(label.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedIds.has(label.id)} />
                      <span
                        className="size-3 rounded-sm shrink-0 border"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate">{label.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {mode === "button" && !isLoading && allLabels.length === 0 && !search.trim() && (
        <p className="text-sm text-muted-foreground">
          Создайте первую метку прямо из этого списка.
        </p>
      )}
    </div>
  )
}
