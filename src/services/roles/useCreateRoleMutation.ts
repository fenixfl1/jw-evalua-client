import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { Role } from './role.type'
import { API_PATH_CREATE_UPDATE_ROLE } from 'src/constants/routes'

interface CreateRolePayload extends Role {
  PERMISSIONS: number[]
}

export function useCreateRoleMutation() {
  return useCustomMutation<Role, CreateRolePayload>({
    initialData: <Role>{},
    mutationKey: ['roles', 'create-role'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Role>(API_PATH_CREATE_UPDATE_ROLE, payload)

      return data
    },
  })
}
