"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { ComplaintTag, PREDEFINED_TAGS } from "@/lib/types/complaint-tag.type"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import { useState } from "react"

interface TagManagerProps {
  tags: string[]
  editable?: boolean
  onTagsChange?: (tags: string[]) => void
}

export function TagManager({
  tags,
  editable = false,
  onTagsChange,
}: TagManagerProps) {
  const [open, setOpen] = useState(false)

  // Получить объект метки по ID
  const getTagById = (tagId: string): ComplaintTag | undefined => {
    return PREDEFINED_TAGS.find((tag) => tag.id === tagId)
  }

  // Добавить метку
  const handleAddTag = (tagId: string) => {
    if (!tags.includes(tagId)) {
      onTagsChange?.([...tags, tagId])
    }
    setOpen(false)
  }

  // Удалить метку
  const handleRemoveTag = (tagId: string) => {
    onTagsChange?.(tags.filter((t) => t !== tagId))
  }

  // Получить доступные метки (еще не добавленные)
  const availableTags = PREDEFINED_TAGS.filter((tag) => !tags.includes(tag.id))

  return (
    <div className="space-y-2">
      {/* Отображение текущих меток */}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">Метки не добавлены</p>
        )}
        {tags.map((tagId) => {
          const tag = getTagById(tagId)

          if (!tag) {
            return (
              <Badge key={tagId} variant="secondary" className="gap-1">
                {tagId}
                {editable && (
                  <button
                    onClick={() => handleRemoveTag(tagId)}
                    className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Удалить тег ${tagId}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            )
          }

          return (
            <Badge
              key={tagId}
              className={cn(tag.color, "text-white gap-1")}
              variant="default"
            >
              {tag.name}
              {editable && (
                <button
                  onClick={() => handleRemoveTag(tagId)}
                  className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Удалить метку ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          )
        })}
      </div>

      {/* Кнопка добавления метки */}
      {editable && availableTags.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить метку
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Поиск меток..." />
              <CommandList>
                <CommandEmpty>Метки не найдены</CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleAddTag(tag.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Badge
                          className={cn(tag.color, "text-white")}
                          variant="default"
                        >
                          {tag.name}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
