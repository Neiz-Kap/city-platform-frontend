"use client"

import { memo } from "react"

interface ComplaintHeaderProps {
  title: string
  status: "new" | "in_progress" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "critical"
  source: "vk" | "email" | "telegram_bot" | "web"
}

const ComplaintHeaderComponent = (props: ComplaintHeaderProps) => {
  const { title } = props
  // Memoize expensive calculations
  // const headerInfo = useMemo(() => ({
  //   status,
  //   priority,
  //   source
  // }), [status, priority, source])

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-0">{title}</h1>
      <div className="flex flex-wrap gap-2">
        {/* <StatusBadge status={headerInfo.status} />
        <PriorityBadge priority={headerInfo.priority} />
        <SourceBadge source={headerInfo.source} /> */}
      </div>
    </div>
  )
}

export const ComplaintHeader = memo(ComplaintHeaderComponent)
