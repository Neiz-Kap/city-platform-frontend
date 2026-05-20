"use client"

import { ArrowLeft, Tags, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MAX_LABELS_PER_ACCOUNT } from "@/lib/api/labels.api"
import { useCreateLabel, useDeleteLabel, useLabels, useUpdateLabel } from "@/lib/hooks/useLabels"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"

const DEFAULT_COLOR = "#6B7280"

function ColorField({
  disabled,
  id,
  onChange,
  value,
}: {
  disabled?: boolean
  id: string
  onChange: (value: string) => void
  value: string
}) {
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (colorInputRef.current && colorInputRef.current.value !== value) {
      colorInputRef.current.value = value
    }
  }, [value])

  return (
    <div className="flex gap-2">
      <input
        ref={colorInputRef}
        id={id}
        type="color"
        className="sr-only"
        defaultValue={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="h-9 w-14 rounded-md border border-border p-1"
        style={{ backgroundColor: value }}
        onClick={() => colorInputRef.current?.click()}
        disabled={disabled}
        aria-label="Выбрать цвет"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-sm"
        disabled={disabled}
        placeholder="#RRGGBB"
      />
    </div>
  )
}

function LabelRow({ label }: { label: DashboardLabel }) {
  const [name, setName] = useState(label.name)
  const [color, setColor] = useState(label.color)
  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()

  const busy = updateLabel.isPending || deleteLabel.isPending

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Введите название метки")
      return
    }
    updateLabel.mutate(
      { id: label.id, body: { name: name.trim(), color } },
      {
        onSuccess: () => toast.success("Метка сохранена"),
        onError: () => toast.error("Не удалось сохранить метку"),
      },
    )
  }

  const handleDelete = () => {
    if (!confirm(`Удалить метку «${label.name}»?`)) return
    deleteLabel.mutate(label.id, {
      onSuccess: () => toast.success("Метка удалена"),
      onError: () => toast.error("Не удалось удалить метку"),
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`name-${label.id}`}>Название</Label>
        <Input
          id={`name-${label.id}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      </div>
      <div className="w-full space-y-2 sm:w-40">
        <Label htmlFor={`color-${label.id}`}>Цвет</Label>
        <ColorField id={`color-${label.id}`} value={color} onChange={setColor} disabled={busy} />
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleSave} disabled={busy}>
          Сохранить
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={busy}
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function LabelsPage() {
  const { data: labels = [], isLoading } = useLabels({ with_counts: true })
  const createLabel = useCreateLabel()

  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(DEFAULT_COLOR)

  const atLimit = labels.length >= MAX_LABELS_PER_ACCOUNT

  const handleCreate = () => {
    if (atLimit) {
      toast.error(`Не более ${MAX_LABELS_PER_ACCOUNT} меток`)
      return
    }
    if (!newName.trim()) {
      toast.error("Введите название метки")
      return
    }
    createLabel.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          toast.success("Метка создана")
          setNewName("")
          setNewColor(DEFAULT_COLOR)
        },
        onError: () => toast.error("Не удалось создать метку (возможно, имя уже используется)"),
      },
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/dashboard/complaint">
          <ArrowLeft className="mr-2 h-4 w-4" />К списку предложений
        </Link>
      </Button>

      <h1 className="mb-2 text-2xl font-bold">Метки дашборда</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        До {MAX_LABELS_PER_ACCOUNT} меток на аккаунт. Название и цвет отображаются в таблице предложений и
        в карточке предложения.
      </p>

      <div className="mb-8 space-y-3 rounded-lg border bg-muted/20 p-4">
        <h2 className="font-medium">Новая метка</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="new-name">Название</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Например, Дороги"
              disabled={atLimit || createLabel.isPending}
            />
          </div>
          <div className="w-full space-y-2 sm:w-40">
            <Label htmlFor="new-color">Цвет</Label>
            <ColorField
              id="new-color"
              value={newColor}
              onChange={setNewColor}
              disabled={atLimit || createLabel.isPending}
            />
          </div>
          <Button type="button" onClick={handleCreate} disabled={atLimit || createLabel.isPending}>
            Создать
          </Button>
        </div>
        {atLimit && (
          <p className="text-sm text-amber-600">
            Достигнут лимит меток ({MAX_LABELS_PER_ACCOUNT}).
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка…</p>
      ) : labels.length === 0 ? (
        /* Empty State for First-Time Users */
        <Card className="my-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Tags className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Метки пока не созданы</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Метки помогают категоризировать предложения по темам (например: «Дороги», «Освещение»,
              «Мусор»). Создайте первую метку, используя форму выше.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Нажмите «Создать» после ввода названия и выбора цвета.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {labels.map((label) => (
            <LabelRow key={`${label.id}-${label.name}-${label.color}`} label={label} />
          ))}
        </div>
      )}
    </div>
  )
}
