import { API_PATH_REQUEST_RESET_PASSWORD } from 'src/constants/routes'
import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'

interface RequestResetPasswordPayload {
  EMAIL: string
  USERNAME: string
}

export function useRequestResetPasswordMutation() {
  return useCustomMutation<string, RequestResetPasswordPayload>({
    initialData: '',
    mutationKey: ['auth', 'request-reset-password'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await postRequest(API_PATH_REQUEST_RESET_PASSWORD, payload)

      return message ?? ''
    },
  })
}
