import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { User } from './users.types'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_USER } from 'src/constants/routes'

export function useCreateUserMutation() {
  return useCustomMutation<User, User>({
    initialData: <User>{},
    mutationKey: ['users', 'create-user'],
    mutationFn: async (payload) => {
      const { data } = await postRequest<User>(
        API_PATH_CREATE_UPDATE_USER,
        payload
      )

      return data
    },
  })
}
