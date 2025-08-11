import { API_PATH_CHANGE_PASSWORD } from 'src/constants/routes'
import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'

interface ChangePasswordPayload {
  OLD_PASSWORD: string
  NEW_PASSWORD: string
  USER_ID: string
}

export function useChangePasswordMutation() {
  return useCustomMutation<string, ChangePasswordPayload>({
    initialData: '',
    mutationKey: ['user', 'change-password'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await putRequest(API_PATH_CHANGE_PASSWORD, payload)

      return `${message}`
    },
  })
}
