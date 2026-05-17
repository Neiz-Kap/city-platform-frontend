"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"

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
import { Switch } from "@/components/ui/switch"

const emailFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Введите название конфигурации")
    .max(100, "Название слишком длинное"),
  imap_server: z.string().trim().min(1, "Введите IMAP-сервер"),
  imap_port: z.coerce
    .number()
    .int("Порт должен быть целым числом")
    .min(1, "Минимальный порт — 1")
    .max(65535, "Максимальный порт — 65535"),
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
  folder: z.string().trim().min(1, "Укажите папку для чтения писем"),
  use_ssl: z.boolean(),
  check_interval: z.coerce
    .number()
    .int("Интервал должен быть целым числом")
    .min(10, "Минимальный интервал — 10 секунд")
    .max(86400, "Максимальный интервал — 86400 секунд"),
})

type EmailFormValues = z.input<typeof emailFormSchema>
type EmailFormSubmitValues = z.output<typeof emailFormSchema>

interface EmailFormProps {
  onSubmit: (data: EmailFormSubmitValues) => void
  isSubmitting?: boolean
}

export function EmailForm({ onSubmit, isSubmitting = false }: EmailFormProps) {
  const form = useForm<EmailFormValues, unknown, EmailFormSubmitValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      name: "",
      imap_server: "",
      imap_port: 993,
      email: "",
      password: "",
      folder: "INBOX",
      use_ssl: true,
      check_interval: 300,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название конфигурации</FormLabel>
              <FormControl>
                <Input placeholder="Основной ящик" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="imap_server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IMAP-сервер</FormLabel>
                <FormControl>
                  <Input placeholder="imap.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imap_port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Порт</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={65535}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={typeof field.value === "number" ? field.value : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="folder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Папка</FormLabel>
                <FormControl>
                  <Input placeholder="INBOX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Интервал проверки (сек.)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={86400}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={typeof field.value === "number" ? field.value : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="use_ssl"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <FormLabel>Использовать SSL</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Обычно включено для IMAP на порту 993.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Создание..." : "Создать почтовый источник"}
        </Button>
      </form>
    </Form>
  )
}
