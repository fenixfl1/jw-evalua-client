import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_USER } from 'src/constants/routes'
import { useUserStore } from 'src/store/user.store'
import { User } from './users.types'

export function useGetUserQuery(username: string) {
  const { setUser } = useUserStore()

  return useQuery<User>({
    enabled: !!username,
    queryKey: ['users', 'get-user'],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<User>(`${API_PATH_GET_USER}${username}`)

      setUser(data)

      return data
    },
  })
}
