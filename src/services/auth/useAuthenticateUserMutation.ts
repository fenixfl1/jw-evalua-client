import { PATH_LOGIN, API_PATH_LOGIN } from 'src/constants/routes'
import { postRequest } from 'src/services/api'
import { createSession, UserData } from 'src/lib/session'
import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { getHomePathByRole } from 'src/utils/get-home-path'

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
          const defaultHome = getHomePathByRole(data.roleId)
          window.location.href = next ?? defaultHome
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return useCustomMutation<UserData, LoginPayload>({
    initialData: <UserData>{},
    mutationKey: ['auth', 'login-user'],
    onSuccess: handleOnSuccess,
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<UserData>(API_PATH_LOGIN, payload)

      return data
    },
  })
}
