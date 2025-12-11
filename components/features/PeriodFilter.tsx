// lib/components/filters/PeriodFilter.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePeriod } from "@/lib/types/complaint-stats.type"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface PeriodFilterProps {
  value: string
  onChange: (value: TimePeriod) => void
}

export function PeriodFilter(props: PeriodFilterProps) {
  const { value, onChange } = props

  const [open, setOpen] = useState(false)

  const periods = [
    { label: "День", value: "day" },
    { label: "Неделя", value: "week" },
    { label: "Месяц", value: "month" },
  ] satisfies { label: string; value: TimePeriod }[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? periods.find((period) => period.value === value)?.label
            : "Выберите период..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Поиск периода..." />
          <CommandEmpty>Период не найден.</CommandEmpty>
          <CommandGroup>
            {periods.map((period) => (
              <CommandItem
                key={period.value}
                value={period.value}
                onSelect={(currentValue) => {
                  onChange(currentValue as TimePeriod)
                  setOpen(false)
                }}
              >
                <CheckIcon
                  className={`mr-2 h-4 w-4 ${
                    value === period.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {period.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
