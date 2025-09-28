import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { Staff } from './staff.types'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_STAFF } from 'src/constants/routes'

export function useUpdateStaffMutation() {
  return useCustomMutation<Staff, Partial<Staff>>({
    initialData: <Staff>{},
    mutationKey: ['staff', 'update-staff'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<Staff>(API_PATH_CREATE_UPDATE_STAFF, payload)

      return data
    },
  })
}
