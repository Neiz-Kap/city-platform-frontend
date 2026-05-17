"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

const subscribe = () => () => {}

export default function ThemeSwitch() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const { theme, setTheme } = useTheme()

  if (!mounted) {
    return null
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="relative"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
