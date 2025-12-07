// lib/components/modals/vk-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import { VkForm } from "../forms/vk-form"

interface VkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VkDialog({ open, onOpenChange }: VkDialogProps) {
  const { createVkGroup } = useSourceManagement()

  const handleSubmit = (data: { url: string; name: string }) => {
    createVkGroup(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить источник ВКонтакте</DialogTitle>
          <DialogDescription>
            Добавьте новую группу ВКонтакте для мониторинга жалоб
          </DialogDescription>
        </DialogHeader>
        <VkForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
