import {
  PATH_LOGIN,
  PATH_DASHBOARD,
  API_PATH_LOGIN,
} from 'src/constants/routes'
import { postRequest } from 'src/services/api'
import { createSession, UserData } from 'src/lib/session'
import { useCustomMutation } from 'src/hooks/use-custom-mutation'

interface LoginPayload {
  username: string
  password: string
}

export function useAuthenticateUserMutation(applyNextUrl = true) {
  const handleOnSuccess = async (data: UserData) => {
    try {
      await createSession(data)

      if (applyNextUrl) {
        const { next } = Object.fromEntries(
          new URLSearchParams(window.location.search)
        )

        if (next || window.location.href.includes(PATH_LOGIN)) {
          window.location.href = next ?? PATH_DASHBOARD
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return useCustomMutation<UserData, LoginPayload>({
    initialData: <UserData>{},
    mutationKey: ['login-user'],
    onSuccess: handleOnSuccess,
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<UserData>(API_PATH_LOGIN, payload)

      return data
    },
  })
}
