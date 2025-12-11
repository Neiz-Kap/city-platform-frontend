// lib/components/modals/email-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import { EmailForm } from "../features/forms/t_email-form"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmailDialog({ open, onOpenChange }: EmailDialogProps) {
  const { createEmailParser } = useSourceManagement()

  const handleSubmit = (data: { name: string }) => {
    createEmailParser(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать почтовый сервер</DialogTitle>
          <DialogDescription>
            Настройте новый почтовый сервер для приема жалоб по электронной почте
          </DialogDescription>
        </DialogHeader>
        <EmailForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
