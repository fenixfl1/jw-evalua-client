import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import {
  API_PATH_GET_WORKED_HOURS_BY_MODULE,
  API_PATH_GET_WORKED_HOURS_BY_STAFF,
} from 'src/constants/routes'

export type WorkedHoursModule = {
  moduleId: number | null
  moduleName: string
  secondsWorked: number
  hoursWorked: number
  activeSessions: number
  staffCount: number
}

export type WorkedHoursStaff = {
  staffId: number
  staffName: string
  moduleId: number | null
  moduleName: string
  secondsWorked: number
  hoursWorked: number
  activeSessions: number
}

export const useGetWorkedHoursByModuleQuery = (period?: number) =>
  useQuery<WorkedHoursModule[]>({
    queryKey: ['dashboard', 'worked-hours', 'modules', period],
    queryFn: async () => {
      const url = buildQueryString(API_PATH_GET_WORKED_HOURS_BY_MODULE, {
        period,
      })
      const {
        data: { data },
      } = await getRequest<WorkedHoursModule[]>(url)

      return data ?? []
    },
  })

export const useGetWorkedHoursByStaffQuery = (
  period?: number,
  moduleId?: number
) =>
  useQuery<WorkedHoursStaff[]>({
    queryKey: ['dashboard', 'worked-hours', 'staff', period, moduleId],
    queryFn: async () => {
      const url = buildQueryString(API_PATH_GET_WORKED_HOURS_BY_STAFF, {
        period,
        moduleId,
      })
      const {
        data: { data },
      } = await getRequest<WorkedHoursStaff[]>(url)

      return data ?? []
    },
  })
