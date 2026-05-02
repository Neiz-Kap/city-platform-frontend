"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MailIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AuthAPI } from "@/lib/api/auth.api";
import { ApiErrorResponse } from "@/lib/types/auth.types";

const formSchema = z.object({
  email: z.string().email("Введите корректный email адрес")
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await AuthAPI.forgotPassword({ email: data.email });

      if (response.success) {
        setIsSubmitted(true);
        toast.success(response.message);

        // В dev-режиме может вернуться resetToken для тестирования
        if (response.data?.resetToken) {
          console.log("[Dev] Reset token:", response.data.resetToken);
        }
      }
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError?.error?.message) {
        toast.error(apiError.error.message);
      } else {
        toast.error("Произошла ошибка при отправке запроса. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Успешное состояние - инструкции отправлены
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-4 lg:h-screen">
        <Card className="mx-auto w-96">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Проверьте email</CardTitle>
            <CardDescription>
              Если указанный email зарегистрирован в системе, мы отправили на него инструкции по сбросу пароля.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p className="mb-4">
              Проверьте папку &quot;Входящие&quot; и &quot;Спам&quot;. Ссылка для сброса пароля действительна в течение ограниченного времени.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
            >
              Отправить повторно
            </Button>
            <p className="text-sm text-center">
              <a href="/dashboard/login" className="underline">
                Вернуться к входу
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Восстановление пароля</CardTitle>
          <CardDescription>
            Введите email адрес, указанный при регистрации. Мы отправим вам инструкции по сбросу пароля.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email" className="sr-only">
                      Email адрес
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform opacity-30" />
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          className="w-full pl-10"
                          placeholder="Введите ваш email"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить инструкции"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            Вспомнили пароль?{" "}
            <a href="/dashboard/login" className="underline">
              Войти
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
