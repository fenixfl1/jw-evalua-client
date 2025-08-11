import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { User } from './users.types'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_USER } from 'src/constants/routes'

export function useUpdateUserMutation() {
  return useCustomMutation<User, Partial<User>>({
    initialData: <User>{},
    mutationKey: ['user', 'update-user'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<User>(API_PATH_CREATE_UPDATE_USER, payload)

      return data
    },
  })
}
