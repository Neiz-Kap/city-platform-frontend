"use client"

import { CommandIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { navItems } from "@/components/layout/sidebar/nav-main"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"

export default function Search() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="lg:flex-1">
      <div className="relative hidden max-w-sm flex-1 lg:block">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          className="h-9 w-full cursor-pointer rounded-md border pr-4 pl-10 text-sm shadow-xs"
          placeholder="Поиск..."
          type="search"
          onFocus={() => setOpen(true)}
        />
        <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
          <CommandIcon className="size-3" />
          <span>k</span>
        </div>
      </div>
      <div className="block lg:hidden">
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)} aria-label="Открыть поиск">
          <SearchIcon />
        </Button>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Поиск по разделам"
        description="Найдите нужный раздел и перейдите в него"
      >
        <CommandInput placeholder="Введите название раздела..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
          {navItems.map((route) => (
            <React.Fragment key={route.title}>
              <CommandGroup heading={route.title}>
                {route.items.map((item, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      setOpen(false)
                      router.push(item.href)
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
