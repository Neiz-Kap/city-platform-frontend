"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/hooks/useAuth"

/**
 * Login form validation schema
 * Based on API_AUTH_CONTRACT.md
 */
const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Form Component
 *
 * Client-side form for user authentication.
 * Uses React Hook Form with Zod validation and TanStack Query for API calls.
 */
export default function LoginForm() {
  const { login, isLoggingIn } = useAuth()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>Введите email и пароль для входа</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                        disabled={isLoggingIn}
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
                    <div className="flex items-center">
                      <FormLabel>Пароль</FormLabel>
                      <Link
                        href="/dashboard/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Забыли пароль?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" disabled={isLoggingIn} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Вход..." : "Войти"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Нет аккаунта?{" "}
            <Link href="/dashboard/register" className="underline">
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
