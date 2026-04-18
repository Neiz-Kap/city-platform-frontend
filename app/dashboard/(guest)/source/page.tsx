"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useSourceManagement } from "@/lib/hooks/useSourceManagement"
import { PlatformGroup, PlatformSource } from "@/lib/types/complaint.type"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

// Lazy loading модальных окон
const VkDialog = dynamic(() => import("@/components/modals/create-vk-modal"), {
  ssr: false,
})
const EmailDialog = dynamic(
  () => import("@/components/modals/create-email-modal"),
  { ssr: false },
)

import dynamic from "next/dynamic"

interface GroupItemProps {
  group: PlatformGroup
  onDelete: (group: PlatformGroup) => void
  onToggle: (id: string, enabled: boolean) => void
}

function GroupItem(props: GroupItemProps) {
  const { group, onDelete, onToggle } = props

  return (
    <li
      key={group.id}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <span className="flex-1 truncate">{group.name}</span>
      <div className="flex items-center gap-2 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(group)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Switch
          checked={group.enabled}
          onCheckedChange={(checked) => onToggle(group.id, checked)}
          aria-label={`Включить группу ${group.name}`}
        />
      </div>
    </li>
  )
}

// Компонент для платформы
function PlatformCard({ platform }: { platform: PlatformSource }) {
  const { updateGroupStatus, deleteGroup, updateAllGroupsStatus } =
    useSourceManagement()

  const [vkDialogOpen, setVkDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const handleDelete = (group: PlatformGroup) => {
    deleteGroup(
      { id: group.id, platform: group.platform },
      {
        onSuccess: () => {
          toast.success(`Группа "${group.name}" успешно удалена.`)
        },
        onError: () => {
          toast.error("Не удалось удалить группу.")
        },
      },
    )
  }

  const handleToggle = (id: string, enabled: boolean) => {
    updateGroupStatus(
      { platform: platform.platform, id, enabled },
      {
        onSuccess: () => {
          toast.success(
            `Группа "${platform.groups.find((g) => g.id === id)?.name}" ${
              enabled ? "включена" : "выключена"
            }`,
          )
        },
        onError: () => {
          toast.error(
            `Не удалось ${enabled ? "включить" : "выключить"} группу "${
              platform.groups.find((g) => g.id === id)?.name
            }"`,
          )
        },
      },
    )
  }

  const handleToggleAll = (enabled: boolean) => {
    updateAllGroupsStatus(
      { platform: platform.platform, enabled },
      {
        onSuccess: () => {
          toast.success(
            `Все группы ${platform.label} ${
              enabled ? "включены" : "выключены"
            }`,
          )
        },
        onError: () => {
          toast.error(
            `Не удалось ${enabled ? "включить" : "выключить"} все группы ${
              platform.label
            }`,
          )
        },
      },
    )
  }

  // Определяем кнопку добавления в зависимости от платформы
  const getAddButton = () => {
    switch (platform.platform) {
      case "vk":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVkDialogOpen(true)}
          >
            Добавить источник
          </Button>
        )
      case "email":
        return (
          <Button variant="outline" size="sm" disabled>
            Создать почтовый сервер
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
      className="mb-4 border rounded-lg overflow-hidden"
    >
      <AccordionItem value={platform.platform}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
          <AccordionTrigger className="flex-1 text-lg font-medium hover:no-underline text-left pb-0">
            {platform.label}
          </AccordionTrigger>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0 sm:gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 whitespace-nowrap">
                Все группы
              </span>
              <Switch
                checked={platform.allEnabled}
                onCheckedChange={handleToggleAll}
                aria-label={`Включить все группы ${platform.label}`}
              />
            </div>
            {getAddButton()}
          </div>
        </div>
        <AccordionContent>
          <ul className="space-y-2 p-2">
            {platform.groups.length === 0 ? (
              <li className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                Нет подключённых групп
              </li>
            ) : (
              platform.groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))
            )}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Модальные окна */}
      <VkDialog open={vkDialogOpen} onOpenChange={setVkDialogOpen} />
      <EmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
    </Accordion>
  )
}

export default function PlatformSourcePage() {
  const { sources, isLoading } = useSourceManagement()

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Источники жалоб</h1>

      {sources.map((platform) => (
        <PlatformCard key={platform.platform} platform={platform} />
      ))}
    </div>
  )
}
