import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import { API_PATH_GET_MODULE_EFFICIENCY } from 'src/constants/routes'
import { ModuleEfficiencyRecord } from './useSaveModuleEfficiencyMutation'

export function useGetModuleEfficiencyQuery(
  moduleId?: number,
  period?: number
) {
  const hasModule = Number.isFinite(moduleId)
  return useQuery<ModuleEfficiencyRecord[] | undefined>({
    enabled: hasModule,
    queryKey: [
      'production',
      'efficiency',
      hasModule ? moduleId : 'none',
      period ?? 'all',
    ],
    queryFn: async () => {
      if (!hasModule) {
        return []
      }

      const path = API_PATH_GET_MODULE_EFFICIENCY.replace(
        ':moduleId',
        String(moduleId)
      )
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
