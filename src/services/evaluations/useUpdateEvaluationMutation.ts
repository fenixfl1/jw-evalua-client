import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_UPDATE_EVALUATION } from 'src/constants/routes'
import {
  EvaluationWithDetails,
  UpdateEvaluationPayload,
} from './evaluation.types'

interface UpdateEvaluationInput extends UpdateEvaluationPayload {
  evaluationId: number
}

export function useUpdateEvaluationMutation() {
  return useCustomMutation<EvaluationWithDetails, UpdateEvaluationInput>({
    initialData: {} as EvaluationWithDetails,
    mutationKey: ['evaluations', 'update'],
    mutationFn: async ({ evaluationId, ...payload }) => {
      const {
        data: { data },
      } = await putRequest<EvaluationWithDetails>(
        `${API_PATH_UPDATE_EVALUATION}${evaluationId}`,
        payload
      )

      return data
    },
  })
}
