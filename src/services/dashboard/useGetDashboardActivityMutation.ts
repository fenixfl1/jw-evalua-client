import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { buildQueryString, getRequest } from '../api'
import {
  ActivityLogEntry,
  DashboardActivityFilters,
  DashboardActivityResponse,
} from './dashboard.types'
import { API_PATH_GET_DASHBOARD_ACTIVITY } from 'src/constants/routes'
import { Metadata } from 'src/types/general'

const defaultPagination: Metadata = {
  currentPage: 1,
  totalPages: 0,
  totalRows: 0,
  count: 0,
  pageSize: 20,
}

const emptyActivity: DashboardActivityResponse = {
  items: [],
  metadata: { pagination: defaultPagination },
}

const normalizeFilters = (filters: DashboardActivityFilters = {}) => ({
  limit: filters.limit ?? defaultPagination.pageSize,
  offset: filters.offset ?? 0,
  action: filters.action ?? undefined,
  model: filters.model ?? undefined,
  userId: filters.userId ?? undefined,
  dateFrom: filters.dateFrom ?? undefined,
  dateTo: filters.dateTo ?? undefined,
})

export function useGetDashboardActivityMutation() {
  return useCustomMutation<DashboardActivityResponse, DashboardActivityFilters>(
    {
      initialData: emptyActivity,
      mutationKey: ['dashboard', 'activity'],
      mutationFn: async (payload = {}) => {
        const filters = normalizeFilters(payload)

        const url = buildQueryString(API_PATH_GET_DASHBOARD_ACTIVITY, filters)
        const response = await getRequest<{
          data: { items: ActivityLogEntry[] }
          metadata: { pagination: Metadata }
        }>(url)

        const items = response.data?.data?.['items'] ?? []
        const metadata = response.data?.metadata ?? emptyActivity.metadata

        return { items, metadata }
      },
    }
  )
}
