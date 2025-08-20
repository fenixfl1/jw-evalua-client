import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { ModuleMemberPayload } from './module.types'
import { postRequest } from '../api'
import { API_PATH_CREATE_OR_UPDATE_MODULE_MEMBERS } from 'src/constants/routes'

export function useCreateOrUpdateModuleMemberMutation() {
  return useCustomMutation<string, ModuleMemberPayload>({
    initialData: '',
    mutationKey: ['work-modules', 'create-or-update-members'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await postRequest(API_PATH_CREATE_OR_UPDATE_MODULE_MEMBERS, payload)

      return message
    },
  })
}
