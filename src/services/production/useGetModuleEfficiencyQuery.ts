import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import {
  API_PATH_GET_MODULE_EFFICIENCY,
} from 'src/constants/routes'
import { ModuleEfficiencyRecord } from './useSaveModuleEfficiencyMutation'

export function useGetModuleEfficiencyQuery(
  moduleId?: number,
  period?: number
) {
  return useQuery<ModuleEfficiencyRecord[] | undefined>({
    enabled: Number.isFinite(moduleId),
    queryKey: ['production', 'efficiency', moduleId, period],
    queryFn: async () => {
      const url = buildQueryString(
        `${API_PATH_GET_MODULE_EFFICIENCY.replace(
          ':moduleId',
          String(moduleId)
        )}`,
        { period }
      )

      const {
        data: { data },
      } = await getRequest<ModuleEfficiencyRecord[]>(url)
      return data ?? []
    },
  })
}
