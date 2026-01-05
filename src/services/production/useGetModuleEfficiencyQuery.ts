import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import {
  API_PATH_GET_MODULE_EFFICIENCY,
  API_PATH_POST_MODULE_EFFICIENCY,
} from 'src/constants/routes'
import { ModuleEfficiencyRecord } from './useSaveModuleEfficiencyMutation'

export function useGetModuleEfficiencyQuery(
  moduleId?: number,
  period?: number
) {
  return useQuery<ModuleEfficiencyRecord[] | undefined>({
    enabled: true,
    queryKey: [
      'production',
      'efficiency',
      Number.isFinite(moduleId) ? moduleId : 'all',
      period ?? 'all',
    ],
    queryFn: async () => {
      const hasModule = Number.isFinite(moduleId)
      const path = hasModule
        ? API_PATH_GET_MODULE_EFFICIENCY.replace(':moduleId', String(moduleId))
        : API_PATH_POST_MODULE_EFFICIENCY
      const url = buildQueryString(path, {
        period,
      })

      const {
        data: { data },
      } = await getRequest<ModuleEfficiencyRecord[]>(url)

      return data ?? []
    },
  })
}
