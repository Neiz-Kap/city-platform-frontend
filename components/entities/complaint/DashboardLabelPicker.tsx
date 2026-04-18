"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLabels } from "@/lib/hooks/useLabels"
import { cn } from "@/lib/utils"

type Props = {
  valueIds: number[]
  onChange: (labelIds: number[]) => void
  disabled?: boolean
}

export function DashboardLabelPicker({
  valueIds,
  onChange,
  disabled,
}: Props) {
  const { data: labels = [], isLoading } = useLabels()

  const set = new Set(valueIds)

  const toggle = (id: number) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка меток…</p>
  }

  if (!labels.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Нет меток. Создайте их на странице «Метки».
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {labels.map((l) => (
        <div key={l.id} className="flex items-center gap-3">
          <Checkbox
            id={`dl-${l.id}`}
            checked={set.has(l.id)}
            disabled={disabled}
            onCheckedChange={() => toggle(l.id)}
          />
          <Label
            htmlFor={`dl-${l.id}`}
            className={cn(
              "flex items-center gap-2 font-normal cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className="size-3 rounded-sm border shrink-0"
              style={{ backgroundColor: l.color }}
            />
            {l.name}
          </Label>
        </div>
      ))}
    </div>
  )
}
