import type { Metadata } from "next"

import { generateMeta } from "@/lib/utils"

export const metadata: Metadata = generateMeta({
  title: "Вход в систему",
  description:
    "Войдите в ODS City Platform для доступа к управлению жалобами и аналитике.",
  canonical: "/dashboard/login",
})

export { default } from "./login-form"
