import { useQuery } from '@tanstack/react-query'
import { getRequest } from 'src/services/api'
import { API_PATH_GET_GOAL_SUMMARY_MODULE } from 'src/constants/routes'
import { ModuleSummary } from './types'

export function useGetModuleSummaryQuery(moduleId?: number, periodId?: number) {
  return useQuery<ModuleSummary | undefined>({
    enabled: !!moduleId && !!periodId,
    queryKey: ['goals', 'summary', 'module', moduleId, periodId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<ModuleSummary>(
        `${API_PATH_GET_GOAL_SUMMARY_MODULE}${moduleId}/${periodId}`
      )
      return data
    },
  })
}
