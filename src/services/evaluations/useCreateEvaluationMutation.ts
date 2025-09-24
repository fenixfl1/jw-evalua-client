import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_EVALUATION } from 'src/constants/routes'
import {
  CreateEvaluationPayload,
  EvaluationWithDetails,
} from './evaluation.types'

export function useCreateEvaluationMutation() {
  return useCustomMutation<EvaluationWithDetails, CreateEvaluationPayload>({
    initialData: {} as EvaluationWithDetails,
    mutationKey: ['evaluations', 'create'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<EvaluationWithDetails>(
        API_PATH_CREATE_EVALUATION,
        payload
      )

      return data
    },
  })
}
