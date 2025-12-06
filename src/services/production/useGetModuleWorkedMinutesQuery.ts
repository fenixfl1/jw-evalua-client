import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import { API_PATH_GET_MODULE_WORKED_MINUTES } from 'src/constants/routes'

type WorkedMinutesResponse = {
  minutesWorked: number
  secondsWorked: number
  activeSessions: number
  totalUnits?: number
}

export function useGetModuleWorkedMinutesQuery(
  moduleId?: number,
  period?: number
) {
  return useQuery<WorkedMinutesResponse | undefined>({
    enabled: Number.isFinite(moduleId),
    queryKey: ['production', 'efficiency', 'worked-minutes', moduleId, period],
    queryFn: async () => {
      const url = buildQueryString(
        API_PATH_GET_MODULE_WORKED_MINUTES.replace(
          ':moduleId',
          String(moduleId)
        ),
        { period }
      )

      const {
        data: { data },
      } = await getRequest<WorkedMinutesResponse>(url)

      return data ?? undefined
    },
  })
}
