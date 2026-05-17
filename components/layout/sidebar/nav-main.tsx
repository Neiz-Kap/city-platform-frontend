"use client"

import { FileDown, ListOrdered, Radio, Tags, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type FlatNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

/** Закомментированные пункты: «Главная», «Проблемы». */
export const flatNavItems: FlatNavItem[] = [
  // { title: "Главная", href: "/dashboard/default", icon: Home },
  { title: "Жалобы", href: "/dashboard/complaint", icon: ListOrdered },
  { title: "Источники жалоб", href: "/dashboard/source", icon: Radio },
  { title: "Метки", href: "/dashboard/labels", icon: Tags },
  { title: "Отчёт PDF", href: "/dashboard/report", icon: FileDown },
  // { title: "Проблемы", href: "/dashboard/nlp/problem", icon: AlertCircle },
]

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

/** @deprecated Используйте flatNavItems */
export const navItems: { title: string; items: FlatNavItem[] }[] = [
  { title: "", items: flatNavItems },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sr-only">Навигация</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {flatNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                isActive={isNavActive(pathname, item.href)}
                tooltip={item.title}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
