import { toast } from "sonner"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { MonitoringAPI } from "@/lib/api/t_monitoring.api"

import { EmailApi } from "../api/source/email.api"
import { VkApi } from "../api/source/vk.api"
import {
  EmailMonitoringConfig,
  PlatformGroup,
  PlatformSource,
  SourcePlatform,
} from "../types/complaint.type"

export type VkFormData = {
  name: string
  url: string
}

export type EmailFormData = EmailMonitoringConfig

const sourceKeys = {
  all: ["sources"] as const,
}

type SourceMutationContext = {
  previousSources?: PlatformSource[]
}

function buildSources(
  vkGroups: PlatformGroup[],
  emailGroups: PlatformGroup[],
  vkGlobalMonitoring: boolean,
) {
  return [
    {
      platform: "vk",
      label: "ВКонтакте",
      // allEnabled отражает состояние глобального мониторинга ВК (/monitoring/vk/status)
      allEnabled: vkGlobalMonitoring,
      groups: vkGroups,
    },
    {
      platform: "email",
      label: "Почта",
      allEnabled: emailGroups.length > 0 && emailGroups.every((group) => group.enabled),
      groups: emailGroups,
    },
    {
      platform: "max",
      label: "Макс",
      allEnabled: false,
      groups: [],
    },
  ] satisfies PlatformSource[]
}

async function fetchSources() {
  const [vkResult, emailResult, vkStatusResult] = await Promise.allSettled([
    VkApi.getGroups(),
    EmailApi.getParsers(),
    MonitoringAPI.getVKMonitoringStatus() as Promise<{ is_monitoring: boolean }>,
  ])

  const vkGroups = vkResult.status === "fulfilled" ? vkResult.value : []
  const emailGroups = emailResult.status === "fulfilled" ? emailResult.value : []
  const vkGlobalMonitoring =
    vkStatusResult.status === "fulfilled" && !!(vkStatusResult.value as { is_monitoring: boolean }).is_monitoring

  if (vkResult.status === "rejected" && emailResult.status === "rejected") {
    throw vkResult.reason
  }

  return buildSources(vkGroups, emailGroups, vkGlobalMonitoring)
}

function patchSourceGroup(
  sources: PlatformSource[],
  platform: SourcePlatform,
  updater: (groups: PlatformGroup[]) => PlatformGroup[],
) {
  return sources.map((source) => {
    if (source.platform !== platform) return source
    return { ...source, groups: updater(source.groups) }
  })
}

function patchSourceAllEnabled(
  sources: PlatformSource[],
  platform: SourcePlatform,
  allEnabled: boolean,
) {
  return sources.map((source) =>
    source.platform === platform ? { ...source, allEnabled } : source,
  )
}

export function useSourceManagement() {
  const queryClient = useQueryClient()

  const {
    data: sources = [],
    isLoading,
    error,
  } = useQuery<PlatformSource[]>({
    queryFn: fetchSources,
    queryKey: sourceKeys.all,
  })

  const updateGroupStatus = useMutation<
    void,
    Error,
    { enabled: boolean; id: string; platform: SourcePlatform },
    SourceMutationContext
  >({
    mutationFn: async ({ platform, id, enabled }) => {
      const action = enabled ? "start" : "stop"
      switch (platform) {
        case "vk":
          return VkApi.updateGroupStatus(id, action)
        case "email":
          return EmailApi.updateParserStatus(id, action)
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all, context.previousSources)
      }
    },
    onMutate: async ({ platform, id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: sourceKeys.all })
      const previousSources = queryClient.getQueryData<PlatformSource[]>(sourceKeys.all)

      queryClient.setQueryData<PlatformSource[]>(sourceKeys.all, (current = []) =>
        patchSourceGroup(current, platform, (groups) =>
          groups.map((group) => (group.id === id ? { ...group, enabled } : group)),
        ),
      )

      return { previousSources }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
  })

  const deleteGroup = useMutation<
    void,
    Error,
    { id: string; platform: SourcePlatform },
    SourceMutationContext
  >({
    mutationFn: async ({ id, platform }) => {
      switch (platform) {
        case "vk":
          return VkApi.deleteGroup(id)
        case "email":
          return EmailApi.deleteParser(id)
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all, context.previousSources)
      }
    },
    onMutate: async ({ id, platform }) => {
      await queryClient.cancelQueries({ queryKey: sourceKeys.all })
      const previousSources = queryClient.getQueryData<PlatformSource[]>(sourceKeys.all)

      queryClient.setQueryData<PlatformSource[]>(sourceKeys.all, (current = []) =>
        patchSourceGroup(current, platform, (groups) => groups.filter((group) => group.id !== id)),
      )

      return { previousSources }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
  })

  const updateAllGroupsStatus = useMutation<
    void,
    Error,
    { enabled: boolean; platform: SourcePlatform },
    SourceMutationContext
  >({
    mutationFn: async ({ platform, enabled }) => {
      if (platform === "vk") {
        // Переключатель «Все группы» управляет глобальным мониторингом ВК
        if (enabled) {
          await MonitoringAPI.startVKMonitoring()
        } else {
          await MonitoringAPI.stopVKMonitoring()
        }
        return
      }
      // Email: старт/стоп каждого парсера по отдельности
      const source = sources.find((item) => item.platform === platform)
      if (!source) return
      const action = enabled ? "start" : "stop"
      await Promise.all(source.groups.map((group) => EmailApi.updateParserStatus(group.id, action)))
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all, context.previousSources)
      }
    },
    onMutate: async ({ platform, enabled }) => {
      await queryClient.cancelQueries({ queryKey: sourceKeys.all })
      const previousSources = queryClient.getQueryData<PlatformSource[]>(sourceKeys.all)

      if (platform === "vk") {
        // Для ВК меняем только allEnabled (состояние глобального мониторинга)
        queryClient.setQueryData<PlatformSource[]>(sourceKeys.all, (current = []) =>
          patchSourceAllEnabled(current, "vk", enabled),
        )
      } else {
        queryClient.setQueryData<PlatformSource[]>(sourceKeys.all, (current = []) =>
          patchSourceGroup(current, platform, (groups) =>
            groups.map((group) => ({ ...group, enabled })),
          ),
        )
      }

      return { previousSources }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
  })

  const createVkGroup = useMutation({
    mutationFn: (data: VkFormData) => VkApi.createGroup(data),
    onError: (error) => {
      const message =
        error instanceof ApiError && error.status === 409
          ? "Группа ВКонтакте с таким URL уже добавлена"
          : getErrorMessage(error, "Не удалось добавить группу ВКонтакте")
      toast.error(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
    onSuccess: () => {
      toast.success("Группа ВКонтакте успешно добавлена")
    },
  })

  const createEmailParser = useMutation({
    mutationFn: (data: EmailFormData) => EmailApi.createParser(data),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Не удалось добавить почтовый источник"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
    onSuccess: () => {
      toast.success("Почтовый источник успешно добавлен")
    },
  })

  return {
    createEmailParser: createEmailParser.mutate,
    createVkGroup: createVkGroup.mutate,
    deleteGroup: deleteGroup.mutate,
    error,
    isBulkUpdatingGroups: updateAllGroupsStatus.isPending,
    isCreatingEmail: createEmailParser.isPending,
    isCreatingVk: createVkGroup.isPending,
    isDeletingGroup: deleteGroup.isPending,
    isLoading,
    isUpdatingGroup: updateGroupStatus.isPending,
    sources,
    updateAllGroupsStatus: updateAllGroupsStatus.mutate,
    updateGroupStatus: updateGroupStatus.mutate,
  }
}
