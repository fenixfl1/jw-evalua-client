import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from 'src/services/api'
import { API_PATH_CREATE_GOAL } from 'src/constants/routes'
import { CreateGoalPayload, Goal } from './types'

export function useCreateGoalMutation() {
  return useCustomMutation<Goal, CreateGoalPayload>({
    initialData: {} as Goal,
    mutationKey: ['goals', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Goal>(API_PATH_CREATE_GOAL, payload)
      return data
    },
  })
}

