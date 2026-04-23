import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { StatsQueryParams } from "@/lib/types/complaint-stats.type"

import { ComplaintStatsApi } from "../api/complaint.api"

export function useComplaintStats(params: StatsQueryParams) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => ComplaintStatsApi.getStats(params),
    queryKey: ["complaint-stats", params],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
