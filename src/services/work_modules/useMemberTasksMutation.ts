import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { GoalTask } from '../../../../server/src/entity/GoalTask'
import { API_PATH_GET_MEMBER_TASKS } from 'src/constants/routes'
import { SimpleCondition } from 'src/types/general'

type GetMemberTaskPayload = SimpleCondition<{
  MODULE_ID: number
  PERIOD: number
  MEMBER_ID: number
  GOAL_ID?: number
}>

export function useGetMemberTasksMutation() {
  return useCustomMutation<GoalTask[], GetMemberTaskPayload>({
    initialData: [],
    mutationKey: ['work-module', 'get-member-task'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<GoalTask[]>(API_PATH_GET_MEMBER_TASKS, payload)

      return data
    },
  })
}
