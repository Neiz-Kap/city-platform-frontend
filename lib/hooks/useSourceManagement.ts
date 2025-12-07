// lib/hooks/useSourceManagement.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { EmailApi } from "../api/source/email.api"
import { TelegramApi } from "../api/source/telegram.api"
import { VkApi } from "../api/source/vk.api"
import {
  PlatformGroup,
  PlatformSource,
  SourcePlatform,
} from "../types/complaint.type"

// Типы для форм создания
export type VkFormData = {
  url: string
  name: string
}

export type TelegramFormData = {
  token: string
  name: string
}

export type EmailFormData = {
  name: string
}

export function useSourceManagement() {
  const queryClient = useQueryClient()

  const {
    data: sources = [],
    isLoading,
    error,
  } = useQuery<PlatformSource[]>({
    queryKey: ["sources"],
    queryFn: async () => {
      const [vkGroups, tgBots, emailParsers] = await Promise.all([
        VkApi.getGroups().catch(() => [] as PlatformGroup[]),
        TelegramApi.getBots().catch(() => [] as PlatformGroup[]),
        EmailApi.getParsers().catch(() => [] as PlatformGroup[]),
      ])

      return [
        {
          platform: "vk",
          label: "ВКонтакте",
          allEnabled: vkGroups.length > 0 && vkGroups.every((g) => g.enabled),
          groups: vkGroups,
        },
        {
          platform: "telegram",
          label: "Telegram Боты",
          allEnabled: tgBots.length > 0 && tgBots.every((g) => g.enabled),
          groups: tgBots,
        },
        {
          platform: "email",
          label: "Почта",
          allEnabled:
            emailParsers.length > 0 && emailParsers.every((g) => g.enabled),
          groups: emailParsers,
        },
      ]
    },
  })

  const updateGroupStatus = useMutation({
    mutationFn: async ({
      platform,
      id,
      enabled,
    }: {
      platform: SourcePlatform
      id: string
      enabled: boolean
    }) => {
      const action = enabled ? "start" : "stop"
      switch (platform) {
        case "vk":
          return VkApi.updateGroupStatus(id, action)
        case "telegram":
          return TelegramApi.updateBotStatus(id, action)
        case "email":
          return EmailApi.updateParserStatus(id, action)
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    },
    onMutate: async ({ platform, id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ["sources"] })

      const prevSources = queryClient.getQueryData<PlatformSource[]>([
        "sources",
      ])

      queryClient.setQueryData(["sources"], (old: PlatformSource[] = []) =>
        old.map((p) => {
          if (p.platform !== platform) return p
          return {
            ...p,
            groups: p.groups.map((g) => (g.id === id ? { ...g, enabled } : g)),
            allEnabled:
              enabled && p.groups.every((g) => g.enabled || g.id === id),
          }
        }),
      )

      return { prevSources }
    },
    onError: (err, variables, context) => {
      if (context?.prevSources) {
        queryClient.setQueryData(["sources"], context.prevSources)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
    },
  })

  const deleteGroup = useMutation({
    mutationFn: async ({
      id,
      platform,
    }: {
      id: string
      platform: SourcePlatform
    }) => {
      switch (platform) {
        case "vk":
          return VkApi.deleteGroup(id)
        case "telegram":
          return TelegramApi.deleteBot(id)
        case "email":
          return EmailApi.deleteParser(id)
        default:
          throw new Error(
            `Unsupported platform: ${platform}`,
          )
      }
    },
    onMutate: async (deletedSource) => {
      await queryClient.cancelQueries({ queryKey: ["sources"] })
      const previousUserSources = queryClient.getQueryData(["sources"]) ?? []

      console.debug(`deletedSource.id: ${deletedSource.id}`)
      queryClient.setQueryData<PlatformGroup[]>(
        ["sources"],
        (oldUserSources = []) => {
          return oldUserSources.filter(
            (oldUserSource) => oldUserSource.id !== deletedSource.id,
          )
        },
      )

      return { previousUserSources }
    },
  })

  const updateAllGroupsStatus = useMutation({
    mutationFn: async ({
      platform,
      enabled,
    }: {
      platform: SourcePlatform
      enabled: boolean
    }) => {
      const source = sources.find((s) => s.platform === platform)
      if (!source) return

      const actions = source.groups.map((group) =>
        updateGroupStatus.mutateAsync({
          platform,
          id: group.id,
          enabled,
        }),
      )
      await Promise.all(actions)
    },
    onMutate: async ({ platform, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ["sources"] })

      const prevSources = queryClient.getQueryData<PlatformSource[]>([
        "sources",
      ])

      queryClient.setQueryData(["sources"], (old: PlatformSource[] = []) =>
        old.map((p) => {
          if (p.platform !== platform) return p
          return {
            ...p,
            allEnabled: enabled,
            groups: p.groups.map((g) => ({ ...g, enabled })),
          }
        }),
      )

      return { prevSources }
    },
    onError: (err, variables, context) => {
      if (context?.prevSources) {
        queryClient.setQueryData(["sources"], context.prevSources)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
    },
  })

  // Добавлено: мутация для создания группы ВКонтакте
  const createVkGroup = useMutation({
    mutationFn: (data: VkFormData) => VkApi.createGroup(data),
    onSuccess: () => {
      toast.success("Группа ВКонтакте успешно добавлена")
    },
    onError: (error) => {
      toast.error(`Не удалось добавить группу: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
    },
  })

  // Добавлено: мутация для создания бота Telegram
  const createTelegramBot = useMutation({
    mutationFn: (data: TelegramFormData) => TelegramApi.createBot(data),
    onSuccess: () => {
      toast.success("Бот Telegram успешно добавлен")
    },
    onError: (error) => {
      toast.error(`Не удалось добавить бота: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
    },
  })

  // Добавлено: мутация для создания почтового парсера
  const createEmailParser = useMutation({
    mutationFn: (data: EmailFormData) => EmailApi.createParser(data),
    onSuccess: () => {
      toast.success("Почтовый парсер успешно добавлен")
    },
    onError: (error) => {
      toast.error(`Не удалось добавить почтовый парсер: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
    },
  })

  return {
    sources,
    isLoading,
    error,
    updateGroupStatus: updateGroupStatus.mutate,
    deleteGroup: deleteGroup.mutate,
    updateAllGroupsStatus: updateAllGroupsStatus.mutate,
    createVkGroup: createVkGroup.mutate,
    createTelegramBot: createTelegramBot.mutate,
    createEmailParser: createEmailParser.mutate,
    isCreatingVk: createVkGroup.isPending,
    isCreatingTelegram: createTelegramBot.isPending,
    isCreatingEmail: createEmailParser.isPending,
  }
}
