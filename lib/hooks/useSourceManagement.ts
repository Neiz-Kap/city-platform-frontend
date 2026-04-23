import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/api/errors"

import { EmailApi } from "../api/source/email.api"
import { VkApi } from "../api/source/vk.api"
import {
  PlatformGroup,
  PlatformSource,
  SourcePlatform,
} from "../types/complaint.type"

export type VkFormData = {
  name: string
  url: string
}

export type EmailFormData = {
  name: string
}

const sourceKeys = {
  all: ["sources"] as const,
}

type SourceMutationContext = {
  previousSources?: PlatformSource[]
}

function buildSources(vkGroups: PlatformGroup[], emailGroups: PlatformGroup[]) {
  return [
    {
      platform: "vk",
      label: "ВКонтакте",
      allEnabled: vkGroups.length > 0 && vkGroups.every((group) => group.enabled),
      groups: vkGroups,
    },
    {
      platform: "email",
      label: "Почта",
      allEnabled:
        emailGroups.length > 0 && emailGroups.every((group) => group.enabled),
      groups: emailGroups,
    },
  ] satisfies PlatformSource[]
}

async function fetchSources() {
  const [vkResult, emailResult] = await Promise.allSettled([
    VkApi.getGroups(),
    EmailApi.getParsers(),
  ])

  const vkGroups = vkResult.status === "fulfilled" ? vkResult.value : []
  const emailGroups = emailResult.status === "fulfilled" ? emailResult.value : []

  if (vkResult.status === "rejected" && emailResult.status === "rejected") {
    throw vkResult.reason
  }

  return buildSources(vkGroups, emailGroups)
}

function patchSourceGroup(
  sources: PlatformSource[],
  platform: SourcePlatform,
  updater: (groups: PlatformGroup[]) => PlatformGroup[],
) {
  return sources.map((source) => {
    if (source.platform !== platform) return source

    const groups = updater(source.groups)
    return {
      ...source,
      allEnabled: groups.length > 0 && groups.every((group) => group.enabled),
      groups,
    }
  })
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
    mutationFn: async ({
      platform,
      id,
      enabled,
    }: {
      enabled: boolean
      id: string
      platform: SourcePlatform
    }) => {
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
          groups.map((group) =>
            group.id === id ? { ...group, enabled } : group,
          ),
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
        patchSourceGroup(current, platform, (groups) =>
          groups.filter((group) => group.id !== id),
        ),
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
    mutationFn: async ({
      platform,
      enabled,
    }: {
      enabled: boolean
      platform: SourcePlatform
    }) => {
      const source = sources.find((item) => item.platform === platform)
      if (!source) return

      const action = enabled ? "start" : "stop"
      await Promise.all(
        source.groups.map((group) => {
          return platform === "vk"
            ? VkApi.updateGroupStatus(group.id, action)
            : EmailApi.updateParserStatus(group.id, action)
        }),
      )
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all, context.previousSources)
      }
    },
    onMutate: async ({ platform, enabled }) => {
      await queryClient.cancelQueries({ queryKey: sourceKeys.all })
      const previousSources = queryClient.getQueryData<PlatformSource[]>(sourceKeys.all)

      queryClient.setQueryData<PlatformSource[]>(sourceKeys.all, (current = []) =>
        patchSourceGroup(current, platform, (groups) =>
          groups.map((group) => ({ ...group, enabled })),
        ),
      )

      return { previousSources }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all })
    },
  })

  const createVkGroup = useMutation({
    mutationFn: (data: VkFormData) => VkApi.createGroup(data),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Не удалось добавить группу ВКонтакте"))
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
      toast.error(
        getErrorMessage(error, "Не удалось добавить почтовый источник"),
      )
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
