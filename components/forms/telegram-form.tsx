// lib/components/forms/telegram-form.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TCreateTelegram } from "@/lib/types/complaint.type"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z, { ZodType } from "zod"

const telegramFormSchema = z.object({
  token: z
    .string()
    .min(1, "Введите токен бота")
    .regex(/^\d+:[a-zA-Z0-9_-]+$/, "Некорректный токен бота Telegram"),
  name: z
    .string()
    .min(1, "Введите название бота")
    .max(100, "Название слишком длинное"),
}) satisfies ZodType<TCreateTelegram>

type TelegramFormValues = z.infer<typeof telegramFormSchema>

interface TelegramFormProps {
  onSubmit: (data: TelegramFormValues) => void
  isSubmitting?: boolean
}

export function TelegramForm({
  onSubmit,
  isSubmitting = false,
}: TelegramFormProps) {
  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      token: "",
      name: "",
    },
  })

  function handleSubmit(data: TelegramFormValues) {
    try {
      onSubmit(data)
    } catch (error) {
      toast.error("Не удалось отправить форму")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Токен бота Telegram</FormLabel>
              <FormControl>
                <Input
                  placeholder="123456789:ABCdefGhIjKlmNoPqRsTuvwXyz"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название бота</FormLabel>
              <FormControl>
                <Input placeholder="Мой бот" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить бота"}
        </Button>
      </form>
    </Form>
  )
}
