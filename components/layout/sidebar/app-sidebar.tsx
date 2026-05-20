"use client"

import { ChevronsUpDown } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useEffect } from "react"

import Logo from "@/components/layout/logo"
import { NavMain } from "@/components/layout/sidebar/nav-main"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsTablet } from "@/lib/hooks/use-mobile"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen, setOpenMobile, isMobile } = useSidebar()
  const isTablet = useIsTablet()

  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname])

  useEffect(() => {
    setOpen(!isTablet)
  }, [isTablet])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-(--primary)/5">
              <Logo />
              <span className="font-semibold">ГорПульс</span>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}
