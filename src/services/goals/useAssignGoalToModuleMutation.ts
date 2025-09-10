import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from 'src/services/api'
import { API_PATH_ASSIGN_GOAL_MODULE } from 'src/constants/routes'
import { AssignGoalToModulePayload } from './types'

export function useAssignGoalToModuleMutation() {
  return useCustomMutation<unknown, AssignGoalToModulePayload>({
    initialData: {},
    mutationKey: ['goals', 'assign-module'],
    mutationFn: async (payload) => {
      const { data } = await postRequest<unknown>(
        API_PATH_ASSIGN_GOAL_MODULE,
        payload
      )
      return data as unknown
    },
  })
}

