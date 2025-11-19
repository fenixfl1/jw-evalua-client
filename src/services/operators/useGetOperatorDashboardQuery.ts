import { useQuery } from '@tanstack/react-query'
import { API_PATH_GET_OPERATOR_DASHBOARD } from 'src/constants/routes'
import { buildQueryString, getRequest } from '../api'
import { OperatorDashboardResponse } from './operators.types'

const emptyDashboard: OperatorDashboardResponse = {
  date: new Date(0).toISOString(),
  period: 0,
  tasks: [],
  totals: {},
  history: [],
}

export function useGetOperatorDashboardQuery(date: string) {
  return useQuery<OperatorDashboardResponse>({
    queryKey: ['operator', 'dashboard', date],
    queryFn: async () => {
      const url = buildQueryString(API_PATH_GET_OPERATOR_DASHBOARD, {
        date,
      })

      const {
        data: { data },
      } = await getRequest<OperatorDashboardResponse>(url)

      if (!data) {
        return { ...emptyDashboard, date }
      }

      return data
    },
    staleTime: 30 * 1000,
  })
}
