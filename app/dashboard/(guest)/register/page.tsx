import type { Metadata } from "next"

import { generateMeta } from "@/lib/utils"

export const metadata: Metadata = generateMeta({
  title: "Регистрация",
  description: "Создайте аккаунт в ГорПульс для доступа к управлению жалобами.",
  canonical: "/dashboard/register",
})

export { default } from "./register-form"
