import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from 'src/services/api'
import { API_PATH_POST_GOAL_PROGRESS } from 'src/constants/routes'
import { PostGoalProgressPayload } from './types'

export function usePostGoalProgressMutation() {
  return useCustomMutation<unknown, PostGoalProgressPayload>({
    initialData: {},
    mutationKey: ['goals', 'post-progress'],
    mutationFn: async (payload) => {
      const { data } = await postRequest<unknown>(
        API_PATH_POST_GOAL_PROGRESS,
        payload
      )
      return data as unknown
    },
  })
}

