import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { Role } from './role.type'
import { API_PATH_CREATE_UPDATE_ROLE } from 'src/constants/routes'

interface UpdateRolePayload extends Partial<Role> {
  PERMISSIONS?: number[]
}

export function useUpdateRoleMutation() {
  return useCustomMutation<Role, UpdateRolePayload>({
    initialData: <Role>{},
    mutationKey: ['roles', 'update-role'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<Role>(API_PATH_CREATE_UPDATE_ROLE, payload)

      return data
    },
  })
}
