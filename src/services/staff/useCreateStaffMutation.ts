import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { Staff } from './staff.types'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_STAFF } from 'src/constants/routes'

export function useCreateStaffMutation() {
  return useCustomMutation<Staff, Staff>({
    initialData: <Staff>{},
    mutationKey: ['staff', 'create-staff'],
    mutationFn: async (payload) => {
      const { data } = await postRequest<Staff>(
        API_PATH_CREATE_UPDATE_STAFF,
        payload
      )

      return data
    },
  })
}
