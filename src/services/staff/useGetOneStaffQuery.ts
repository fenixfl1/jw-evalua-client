import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { Staff } from './staff.types'
import { API_PATH_GET_ONE_STAFF } from 'src/constants/routes'

export function useGetOneStaffQuery(staffId: number) {
  return useQuery({
    queryKey: ['staff', 'get-one-staff', staffId],
    enabled: !!staffId,
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<Staff>(`${API_PATH_GET_ONE_STAFF}${staffId}`)

      return data
    },
  })
}
