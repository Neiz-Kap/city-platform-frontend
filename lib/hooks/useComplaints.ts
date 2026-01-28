import {
  CreateComplaintRequest,
  type ComplaintQueryParams,
} from "@/lib/types/complaint.type"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ComplaintAPI } from "../api/complaint.api"

// Query keys
export const complaintKeys = {
  all: ["complaints"] as const,
  lists: () => [...complaintKeys.all, "list"] as const,
  list: (filters: ComplaintQueryParams) =>
    [...complaintKeys.lists(), { filters }] as const,
  details: () => [...complaintKeys.all, "detail"] as const,
  detail: (id: string) => [...complaintKeys.details(), id] as const,
}

// Queries
export const useComplaints = (params: ComplaintQueryParams = {}) => {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => ComplaintAPI.getAll(params),
    staleTime: 5 * 60 * 1000,
    // keepPreviousData: true, // This helps with pagination UX
  })
}

export const useComplaint = (id: string) => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => ComplaintAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    // Пытаемся найти жалобу в кэшированных списках
    initialData: () => {
      // Получаем все закэшированные списки жалоб
      const cachedLists = queryClient
        .getQueryCache()
        .findAll({ queryKey: complaintKeys.lists() })

      // Ищем жалобу во всех закэшированных списках
      for (const query of cachedLists) {
        const data = query.state.data as any
        if (data?.data) {
          const complaint = data.data.find(
            (c: any) => c.id.toString() === id
          )
          if (complaint) {
            return complaint
          }
        }
      }
      return undefined
    },
    // initialDataUpdatedAt используется для определения, нужно ли обновить данные
    // Если мы нашли данные в кэше, но они старые - запрос все равно выполнится
    initialDataUpdatedAt: () => {
      const cachedLists = queryClient
        .getQueryCache()
        .findAll({ queryKey: complaintKeys.lists() })

      // Возвращаем самое свежее время обновления из всех списков
      const timestamps = cachedLists.map(q => q.state.dataUpdatedAt)
      return timestamps.length > 0 ? Math.max(...timestamps) : 0
    },
  })
}

// Mutations
export const useCreateComplaint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (complaintData: CreateComplaintRequest) =>
      ComplaintAPI.create(complaintData),
    onSuccess: () => {
      // Invalidate and refetch complaints list
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
    },
  })
}

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ComplaintAPI.delete(id),
    onSuccess: () => {
      // Invalidate and refetch complaints list
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() })
    },
  })
}
