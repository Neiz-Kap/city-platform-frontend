"use client"

import dynamic from "next/dynamic"
import { MoreHorizontal, Plus, Radio, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { getErrorMessage } from "@/lib/api/errors"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import { PlatformGroup, PlatformSource, SourcePlatform } from "@/lib/types/complaint.type"

const VkDialog = dynamic(() => import("@/components/modals/create-vk-modal"), {
  ssr: false,
})
const EmailDialog = dynamic(
  () => import("@/components/modals/create-email-modal"),
  { ssr: false },
)

interface PlatformCardActions {
  deleteGroup: (group: PlatformGroup) => void
  isBusy: boolean
  toggleAllGroups: (platform: SourcePlatform, enabled: boolean, label: string) => void
  toggleGroup: (platform: SourcePlatform, id: string, enabled: boolean, groupName: string) => void
}

interface GroupItemProps {
  group: PlatformGroup
  isBusy: boolean
  onDelete: (group: PlatformGroup) => void
  onToggle: (id: string, enabled: boolean) => void
}

function GroupItem({ group, isBusy, onDelete, onToggle }: GroupItemProps) {
  return (
    <li className="flex items-center justify-between rounded bg-gray-50 p-3 transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
      <span className="flex-1 truncate">{group.name}</span>
      <div className="ml-4 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(group)}
              disabled={isBusy}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Switch
          checked={group.enabled}
          onCheckedChange={(checked) => onToggle(group.id, checked)}
          aria-label={`Включить группу ${group.name}`}
          disabled={isBusy}
        />
      </div>
    </li>
  )
}

function PlatformCard({
  platform,
  actions,
}: {
  actions: PlatformCardActions
  platform: PlatformSource
}) {
  const [vkDialogOpen, setVkDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const getAddButton = () => {
    switch (platform.platform) {
      case "vk":
        return (
          <Button variant="outline" size="sm" onClick={() => setVkDialogOpen(true)}>
            Добавить источник
          </Button>
        )
      case "email":
        return (
          <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
            Добавить почту
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      key={platform.platform}
      className="mb-4 overflow-hidden rounded-lg border"
    >
      <AccordionItem value={platform.platform}>
        <div className="flex flex-col items-start justify-between border-b p-4 sm:flex-row sm:items-center">
          <AccordionTrigger className="flex-1 pb-0 text-left text-lg font-medium hover:no-underline">
            {platform.label}
          </AccordionTrigger>
          <div className="mt-2 flex flex-col items-start gap-2 sm:mt-0 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center">
              <span className="mr-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                Все группы
              </span>
              <Switch
                checked={platform.allEnabled}
                onCheckedChange={(enabled) =>
                  actions.toggleAllGroups(platform.platform, enabled, platform.label)
                }
                aria-label={`Включить все группы ${platform.label}`}
                disabled={actions.isBusy}
              />
            </div>
            {getAddButton()}
          </div>
        </div>
        <AccordionContent>
          <ul className="space-y-2 p-2">
            {platform.groups.length === 0 ? (
              <li className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Нет подключённых групп
              </li>
            ) : (
              platform.groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isBusy={actions.isBusy}
                  onDelete={actions.deleteGroup}
                  onToggle={(id, enabled) =>
                    actions.toggleGroup(platform.platform, id, enabled, group.name)
                  }
                />
              ))
            )}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <VkDialog open={vkDialogOpen} onOpenChange={setVkDialogOpen} />
      <EmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
    </Accordion>
  )
}

function SourceSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-lg border bg-muted/40" />
      ))}
    </div>
  )
}

export default function PlatformSourcePage() {
  const {
    sources,
    isLoading,
    error,
    updateGroupStatus,
    deleteGroup,
    updateAllGroupsStatus,
    isUpdatingGroup,
    isDeletingGroup,
    isBulkUpdatingGroups,
  } = useSourceManagement()

  const isBusy = isUpdatingGroup || isDeletingGroup || isBulkUpdatingGroups
  const totalGroups = sources.reduce((sum, source) => sum + source.groups.length, 0)
  const activeGroups = sources.reduce(
    (sum, source) => sum + source.groups.filter((group) => group.enabled).length,
    0,
  )

  const handleDelete = (group: PlatformGroup) => {
    deleteGroup(
      { id: group.id, platform: group.platform },
      {
        onError: (error) => {
          toast.error(getErrorMessage(error, "Не удалось удалить группу."))
        },
        onSuccess: () => {
          toast.success(`Группа «${group.name}» успешно удалена.`)
        },
      },
    )
  }

  const handleToggle = (
    platform: SourcePlatform,
    id: string,
    enabled: boolean,
    groupName: string,
  ) => {
    updateGroupStatus(
      { platform, id, enabled },
      {
        onError: (error) => {
          toast.error(
            getErrorMessage(
              error,
              `Не удалось ${enabled ? "включить" : "выключить"} группу «${groupName}».`,
            ),
          )
        },
        onSuccess: () => {
          toast.success(`Группа «${groupName}» ${enabled ? "включена" : "выключена"}`)
        },
      },
    )
  }

  const handleToggleAll = (
    platform: SourcePlatform,
    enabled: boolean,
    label: string,
  ) => {
    updateAllGroupsStatus(
      { platform, enabled },
      {
        onError: (error) => {
          toast.error(
            getErrorMessage(
              error,
              `Не удалось ${enabled ? "включить" : "выключить"} все группы ${label}.`,
            ),
          )
        },
        onSuccess: () => {
          toast.success(`Все группы ${label} ${enabled ? "включены" : "выключены"}`)
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Источники жалоб</h1>
          <p className="text-muted-foreground text-sm">
            Управляйте подключёнными каналами мониторинга без перезагрузки страницы.
          </p>
        </div>
        <div className="text-muted-foreground grid grid-cols-2 gap-3 text-sm sm:text-right">
          <div>
            <div className="font-semibold text-foreground">{activeGroups}</div>
            <div>активных групп</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{totalGroups}</div>
            <div>всего подключено</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SourceSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Не удалось загрузить источники: {getErrorMessage(error)}
        </div>
      ) : (
        <>
          {/* Empty State for First-Time Users */}
          {totalGroups === 0 && (
            <Card className="my-8">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Radio className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Источники не подключены</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Для начала мониторинга жалоб необходимо добавить источники. Выберите платформу ниже и нажмите «Добавить источник», чтобы подключить группы ВКонтакте или почтовые ящики для отслеживания.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {sources.map((platform) => (
            <PlatformCard
              key={platform.platform}
              platform={platform}
              actions={{
                deleteGroup: handleDelete,
                isBusy,
                toggleAllGroups: handleToggleAll,
                toggleGroup: handleToggle,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
