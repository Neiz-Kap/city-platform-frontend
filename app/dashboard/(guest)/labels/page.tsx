"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MAX_LABELS_PER_ACCOUNT,
} from "@/lib/api/labels.api"
import {
  useCreateLabel,
  useDeleteLabel,
  useLabels,
  useUpdateLabel,
} from "@/lib/hooks/useLabels"
import type { DashboardLabel } from "@/lib/types/complaint-label.type"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const DEFAULT_COLOR = "#6B7280"

function LabelRow({ label }: { label: DashboardLabel }) {
  const [name, setName] = useState(label.name)
  const [color, setColor] = useState(label.color)
  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()

  useEffect(() => {
    setName(label.name)
    setColor(label.color)
  }, [label.name, label.color])

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end border rounded-lg p-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`name-${label.id}`}>Название</Label>
        <Input
          id={`name-${label.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="space-y-2 w-full sm:w-40">
        <Label htmlFor={`color-${label.id}`}>Цвет</Label>
        <div className="flex gap-2">
          <Input
            id={`color-${label.id}`}
            type="color"
            className="h-9 w-14 p-1 cursor-pointer"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={busy}
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="font-mono text-sm"
            disabled={busy}
            placeholder="#RRGGBB"
          />
        </div>
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
        onError: () => toast.error("Не удалось создать метку (возможно, дубликат имени)"),
      },
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/dashboard/complaint">
          <ArrowLeft className="mr-2 h-4 w-4" />
          К списку жалоб
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-2">Метки дашборда</h1>
      <p className="text-sm text-muted-foreground mb-6">
        До {MAX_LABELS_PER_ACCOUNT} меток на аккаунт (лимит на клиенте). Название и цвет
        отображаются в таблице жалоб и на карточке проблемы.
      </p>

      <div className="border rounded-lg p-4 mb-8 space-y-3 bg-muted/20">
        <h2 className="font-medium">Новая метка</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="new-name">Название</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например, Дороги"
              disabled={atLimit || createLabel.isPending}
            />
          </div>
          <div className="space-y-2 w-full sm:w-40">
            <Label htmlFor="new-color">Цвет</Label>
            <div className="flex gap-2">
              <Input
                id="new-color"
                type="color"
                className="h-9 w-14 p-1 cursor-pointer"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                disabled={atLimit || createLabel.isPending}
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="font-mono text-sm"
                disabled={atLimit || createLabel.isPending}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={atLimit || createLabel.isPending}
          >
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
        <p className="text-muted-foreground">Меток пока нет.</p>
      ) : (
        <div className="space-y-4">
          {labels.map((l) => (
            <LabelRow key={l.id} label={l} />
          ))}
        </div>
      )}
    </div>
  )
}
