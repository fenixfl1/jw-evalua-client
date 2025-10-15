import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from 'src/services/api'
import { API_PATH_CREATE_UPDATE_GOAL } from 'src/constants/routes'
import { Goal } from './types'

interface UpdateGoalPayload extends Omit<Partial<Goal>, 'GOAL_ID'> {
  GOAL_ID: number
}

export function useUpdateGoalMutation() {
  return useCustomMutation<string, UpdateGoalPayload>({
    initialData: '',
    mutationKey: ['goals', 'update-goal'],
    mutationFn: async (payload) => {
      const {
        data: { message },
      } = await putRequest<Goal>(API_PATH_CREATE_UPDATE_GOAL, payload)

      return message
    },
  })
}
