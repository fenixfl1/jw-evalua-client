import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { CreateModulePayload } from './module.types'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_MODULE } from 'src/constants/routes'

export function useCreateModuleMutation() {
  return useCustomMutation<string, CreateModulePayload>({
    initialData: '',
    mutationKey: ['work-modules', 'create-module'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await postRequest(API_PATH_CREATE_UPDATE_MODULE, payload)

      return message
    },
  })
}
