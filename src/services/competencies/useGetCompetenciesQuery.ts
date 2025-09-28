import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { getRequest } from '../api'
import { API_PATH_GET_COMPETENCIES } from 'src/constants/routes'
import { Competency } from './competency.types'

export function useGetCompetenciesQuery(enabled: boolean = true) {
  return useQuery<Competency[]>({
    enabled,
    queryKey: ['competencies', 'list'],
    queryFn: async () => {
      try {
        const {
          data: { data },
        } = await getRequest<Competency[]>(API_PATH_GET_COMPETENCIES)

        return data ?? []
      } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.response?.status === 204) {
          return []
        }
        throw error
      }
    },
  })
}
