import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { UpdateModulePayload } from './module.types'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_MODULE } from 'src/constants/routes'

export function useUpdateModuleMutation() {
  return useCustomMutation<string, UpdateModulePayload>({
    initialData: '',
    mutationKey: ['work-modules', 'update-module'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await putRequest(API_PATH_CREATE_UPDATE_MODULE, payload)

      return message
    },
  })
}
