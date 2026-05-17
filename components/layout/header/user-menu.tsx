"use client"

import { BadgeCheck, LogOut, UserCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthActions, useUser } from "@/lib/hooks/useAuth"

/**
 * UserMenu component
 *
 * Displays user info from backend API when authenticated,
 * or a guest fallback when not authenticated.
 */
export default function UserMenu() {
  const { user, isLoading, isAuthenticated } = useUser()
  const { logout } = useAuthActions()

  // Генерация инициалов из имени пользователя
  const getInitials = (name: string): string => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="hidden h-4 w-24 sm:block" />
      </div>
    )
  }

  // Фолбэк для гостя (не авторизованного пользователя)
  if (!isAuthenticated || !user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarImage src={undefined} alt="Гость" />
            <AvatarFallback className="rounded-lg bg-muted">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
          align="end"
        >
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="rounded-lg">
                <AvatarImage src={undefined} alt="Гость" />
                <AvatarFallback className="rounded-lg bg-muted">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Гость</span>
                <span className="truncate text-xs text-muted-foreground">
                  Войдите для доступа к системе
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a href="/dashboard/login" className="flex items-center gap-2 cursor-pointer">
                <BadgeCheck className="h-4 w-4" />
                Войти
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/register" className="flex items-center gap-2 cursor-pointer">
                <UserCircle className="h-4 w-4" />
                Зарегистрироваться
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Авторизованный пользователь
  const initials = getInitials(user.name)
  const avatarFallback = initials || "??"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
          <AvatarImage src={undefined} alt={user.name} />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="rounded-lg">
              <AvatarImage src={undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
              <BadgeCheck className="h-4 w-4" />
              Профиль
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
