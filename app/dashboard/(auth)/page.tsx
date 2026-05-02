import { redirect } from "next/navigation"

/* Страница `/dashboard/default` отключена.
 *
 * "use client"
 *
 * export default function Page() {
 *   return (
 *     <div className="bg-background grid h-screen items-center pb-8 lg:grid-cols-2 lg:pb-0">
 *       Дефолт
 *     </div>
 *   )
 * }
 */

export default function Page() {
  redirect("/dashboard/complaint")
}
