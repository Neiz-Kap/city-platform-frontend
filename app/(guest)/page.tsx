import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Guest Landing Page
 *
 * Welcome page for unauthenticated users.
 * Provides navigation to login and registration pages.
 */
export default function GuestLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">ГорПульс</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/dashboard/register">
              <Button>Регистрация</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Добро пожаловать</CardTitle>
            <CardDescription className="text-lg">
              Платформа мониторинга обращений граждан
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Авторизуйтесь для доступа к системе управления предложениями, аналитике и настройке
              источников.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Войти в систему
                </Button>
              </Link>
              <Link href="/dashboard/register" className="flex-1">
                <Button className="w-full">Создать аккаунт</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          ГорПульс 2026
        </div>
      </footer>
    </div>
  )
}
