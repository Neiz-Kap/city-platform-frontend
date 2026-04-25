"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import type { EmailMonitoringConfig } from "@/lib/types/complaint.type"

import { EmailForm } from "../features/forms/t_email-form"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmailDialog({ open, onOpenChange }: EmailDialogProps) {
  const { createEmailParser, isCreatingEmail } = useSourceManagement()

  const handleSubmit = (data: EmailMonitoringConfig) => {
    createEmailParser(data, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Создать почтовый источник</DialogTitle>
          <DialogDescription>
            Настройте IMAP-подключение для приёма жалоб по электронной почте.
          </DialogDescription>
        </DialogHeader>
        <EmailForm onSubmit={handleSubmit} isSubmitting={isCreatingEmail} />
      </DialogContent>
    </Dialog>
  )
}
