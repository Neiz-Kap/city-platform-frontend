// lib/components/modals/telegram-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import { TelegramForm } from "../forms/telegram-form"

interface TelegramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TelegramDialog({ open, onOpenChange }: TelegramDialogProps) {
  const { createTelegramBot } = useSourceManagement()

  const handleSubmit = (data: { token: string; name: string }) => {
    createTelegramBot(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить бота Telegram</DialogTitle>
          <DialogDescription>
            Добавьте нового бота Telegram для приема жалоб
          </DialogDescription>
        </DialogHeader>
        <TelegramForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
