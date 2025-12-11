import { StatsQueryParams } from "@/lib/types/complaint-stats.type"
import { useQuery } from "@tanstack/react-query"
import { ComplaintStatsApi } from "../api/complaint.api"

export function useComplaintStats(params: StatsQueryParams) {
  return useQuery({
    queryKey: ["complaint-stats", params],
    queryFn: () => ComplaintStatsApi.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}