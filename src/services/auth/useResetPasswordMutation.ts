import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_RESET_PASSWORD } from 'src/constants/routes'

interface ResetPasswordPayload {
  token: string
  password: string
}

export const useResetPasswordMutation = () => {
  return useCustomMutation<string, ResetPasswordPayload>({
    initialData: '',
    mutationKey: ['auth', 'reset-password'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await postRequest(API_PATH_RESET_PASSWORD, payload)

      return message ?? ''
    },
  })
}
