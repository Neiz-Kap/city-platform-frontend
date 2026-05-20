import { ThemeProvider } from "next-themes"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import NextTopLoader from "nextjs-toploader"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { type ReactNode } from "react"

import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"

import "./envConfig.ts"
import "./globals.css"

import { ActiveThemeProvider } from "@/components/active-theme"
import { Toaster } from "@/components/ui/sonner"
import { DEFAULT_THEME, type ThemeType } from "@/lib/themes"

import Providers from "./providers"

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const messages = await getMessages()
  const cookieStore = await cookies()
  const themeSettings = {
    preset: (cookieStore.get("theme_preset")?.value ?? DEFAULT_THEME.preset) as ThemeType["preset"],
    scale: (cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale) as ThemeType["scale"],
    radius: (cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius) as ThemeType["radius"],
    contentLayout: (cookieStore.get("theme_content_layout")?.value ??
      DEFAULT_THEME.contentLayout) as ThemeType["contentLayout"],
  }

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([, value]) => value)
      .map(([key, value]) => [`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value]),
  )

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script async crossOrigin="anonymous" src="https://tweakcn.com/live-preview.min.js" />
      </head>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}
        {...bodyAttributes}
      >
        <NextIntlClientProvider messages={messages} locale="ru">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>
              <ActiveThemeProvider initialTheme={themeSettings}>
                {children}
                <Toaster position="top-center" richColors />
                <NextTopLoader
                  color="var(--primary)"
                  showSpinner={false}
                  height={2}
                  shadow-sm="none"
                />
                {/*{process.env.NODE_ENV === "production" ? (
                <GoogleAnalyticsInit />
              ) : null}*/}
              </ActiveThemeProvider>
            </NuqsAdapter>
          </ThemeProvider>
        </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
