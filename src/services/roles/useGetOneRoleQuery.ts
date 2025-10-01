import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { Role } from './role.type'
import { API_PATH_GET_ONE_ROLE } from 'src/constants/routes'
import { useRoleStore } from 'src/store/role.store'

export function useGetOneRoleQuery(roleId: number) {
  const { setRole } = useRoleStore()

  return useQuery({
    queryKey: ['roles', 'get-one-role', roleId],
    enabled: !!roleId,
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<Role>(API_PATH_GET_ONE_ROLE, roleId)

      setRole(data)

      return data
    },
  })
}
