"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuth } from "@/lib/hooks/useAuth"

/**
 * Registration form validation schema
 * Based on API_AUTH_CONTRACT.md:
 * - name: ФИО, только кириллица, мин. 2 слова, макс. 255 символов
 * - email: валидный email формат
 * - password: мин. 8 символов, заглавная, строчная, цифра
 */
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Имя обязательно")
    .max(255, "Максимум 255 символов")
    .regex(
      /^[а-яА-ЯёЁ\s-]+$/,
      "Только кириллица, пробелы и дефисы",
    )
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "Введите фамилию и имя (минимум 2 слова)",
    }),
  email: z.string().email("Введите корректный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Z]/, "Должна быть заглавная буква")
    .regex(/[a-z]/, "Должна быть строчная буква")
    .regex(/\d/, "Должна быть цифра"),
})

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Register Form Component
 *
 * Client-side form for user registration.
 * Uses React Hook Form with Zod validation according to API contract.
 */
export default function RegisterForm() {
  const { register, isRegistering } = useAuth()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    register(data)
  }

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Иванов Иван"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Мин. 8 символов, заглавная, строчная, цифра"
                        disabled={isRegistering}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering}
              >
                {isRegistering ? "Создание..." : "Зарегистрироваться"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Уже есть аккаунт?{" "}
            <Link href="/dashboard/login" className="underline">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
