import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { Goal } from '../goals/types'
import { API_PATH_GET_MODULE_GOAL } from 'src/constants/routes'
import { SimpleCondition } from 'src/types/general'

type GetModuleGoalPayload = SimpleCondition<{
  MODULE_ID: number
  PERIOD: number
}>

export function useGetModuleGoalsMutation() {
  return useCustomMutation<Goal[], GetModuleGoalPayload>({
    initialData: [],
    mutationKey: ['module', 'get-module-goal'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Goal[]>(API_PATH_GET_MODULE_GOAL, payload)

      return data
    },
  })
}
