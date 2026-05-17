"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

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

const vkFormSchema = z.object({
  url: z
    .string()
    .min(1, "Введите ссылку на группу")
    .regex(
      /^(https?:\/\/)?(www\.)?vk\.com\/[a-zA-Z0-9_]+/,
      "Некорректная ссылка на группу ВКонтакте",
    ),
  name: z.string().min(1, "Введите название группы").max(100, "Название слишком длинное"),
})

type VkFormValues = z.infer<typeof vkFormSchema>

interface VkFormProps {
  onSubmit: (data: VkFormValues) => void
  isSubmitting?: boolean
}

export function VkForm({ onSubmit, isSubmitting = false }: VkFormProps) {
  const form = useForm<VkFormValues>({
    resolver: zodResolver(vkFormSchema),
    defaultValues: {
      url: "",
      name: "",
    },
  })

  function handleSubmit(data: VkFormValues) {
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на группу ВКонтакте</FormLabel>
              <FormControl>
                <Input placeholder="https://vk.com/group_name" {...field} />
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
              <FormLabel>Название группы</FormLabel>
              <FormControl>
                <Input placeholder="Название группы" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить источник"}
        </Button>
      </form>
    </Form>
  )
}
