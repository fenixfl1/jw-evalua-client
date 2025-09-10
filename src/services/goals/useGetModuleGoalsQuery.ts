import { useQuery } from '@tanstack/react-query'
import { getRequest } from 'src/services/api'
import { API_PATH_GET_GOALS_BY_MODULE } from 'src/constants/routes'
import { Goal } from './types'

export function useGetModuleGoalsQuery(moduleId?: number) {
  return useQuery({
    enabled: !!moduleId,
    initialData: [] as Goal[],
    queryKey: ['goals', 'by-module', moduleId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<Goal[]>(`${API_PATH_GET_GOALS_BY_MODULE}${moduleId}`)
      return data
    },
  })
}

