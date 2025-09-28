import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { buildQueryString, getRequest } from '../api'
import {
  DashboardSummaryFilters,
  DashboardSummaryResponse,
} from './dashboard.types'
import { API_PATH_GET_DASHBOARD_SUMMARY } from 'src/constants/routes'

const emptySummary: DashboardSummaryResponse = {
  kpis: {
    totalStaff: 0,
    activeModules: 0,
    newStaffLast30Days: 0,
    evaluationsCompleted: 0,
    evaluationsPending: 0,
    evaluationsAverageScore: null,
    activeGoals: 0,
    goalComplianceAverage: null,
  },
  evaluationsTrend: [],
  evaluationsByModule: [],
  goalComplianceByModule: [],
  staffDistribution: [],
  recentEvaluations: [],
  filters: {
    modules: [],
    periods: [],
  },
}

const serializeFilters = (filters: DashboardSummaryFilters) => ({
  moduleId: filters.moduleId ?? undefined,
  periodStart: filters.periodStart ?? undefined,
  periodEnd: filters.periodEnd ?? undefined,
})

export function useGetDashboardSummaryQuery(filters: DashboardSummaryFilters) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard', 'summary', serializeFilters(filters)],
    queryFn: async () => {
      try {
        const url = buildQueryString(
          API_PATH_GET_DASHBOARD_SUMMARY,
          serializeFilters(filters)
        )

        const {
          data: { data },
        } = await getRequest<DashboardSummaryResponse>(url)

        return data ?? emptySummary
      } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.response?.status === 204) {
          return emptySummary
        }
        throw error
      }
    },
    staleTime: 60 * 1000,
  })
}
