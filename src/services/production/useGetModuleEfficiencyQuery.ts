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
  const hasModule = Number.isFinite(moduleId)
  return useQuery<ModuleEfficiencyRecord[] | undefined>({
    enabled: hasModule || moduleId === undefined,
    queryKey: [
      'production',
      'efficiency',
      hasModule ? moduleId : 'all',
      period,
    ],
    queryFn: async () => {
      // eslint-disable-next-line no-console
      console.log({ hasModule })

      const path = hasModule
        ? API_PATH_GET_MODULE_EFFICIENCY.replace(':moduleId', String(moduleId))
        : API_PATH_POST_MODULE_EFFICIENCY
      const url = buildQueryString(path, {
        period: hasModule ? period : undefined,
      })

      const {
        data: { data },
      } = await getRequest<ModuleEfficiencyRecord[]>(url)

      // eslint-disable-next-line no-console
      console.log({ data })

      return data ?? []
    },
  })
}
