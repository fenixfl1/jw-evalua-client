import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import { API_PATH_GET_GOAL_MODULE_TASKS } from 'src/constants/routes'
import { ModuleTaskSummary } from './types'

export function useGetGoalTasksDetailQuery(
  moduleId?: number,
  period?: number,
  goalId?: number
) {
  return useQuery<ModuleTaskSummary[] | undefined>({
    enabled:
      typeof moduleId === 'number' &&
      typeof period === 'number' &&
      typeof goalId === 'number',
    queryKey: ['goals', 'tasks', 'detail', moduleId, period, goalId],
    queryFn: async () => {
      const url = buildQueryString(
        `${API_PATH_GET_GOAL_MODULE_TASKS}/${moduleId}/tasks`,
        { period, goalId }
      )

      const {
        data: { data },
      } = await getRequest<ModuleTaskSummary[]>(url)

      // eslint-disable-next-line no-console
      console.log({ data })

      return data ?? []
    },
  })
}
