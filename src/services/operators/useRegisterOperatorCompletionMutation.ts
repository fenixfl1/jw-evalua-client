import { useMutation } from '@tanstack/react-query'
import {
  API_PATH_OPERATOR_TASK_COMPLETIONS,
} from 'src/constants/routes'
import { postRequest } from '../api'
import { OperatorCompletionResponse } from './operators.types'

interface RegisterCompletionPayload {
  taskId: number
  timestamp: string
  units?: number
  staffId?: number
  metadata?: Record<string, unknown>
}

export function useRegisterOperatorCompletionMutation() {
  return useMutation<
    OperatorCompletionResponse,
    Error,
    RegisterCompletionPayload
  >({
    mutationKey: ['operator', 'tasks', 'complete'],
    mutationFn: async ({ taskId, timestamp, units, staffId, metadata }) => {
      const {
        data: { data },
      } = await postRequest<OperatorCompletionResponse>(
        `${API_PATH_OPERATOR_TASK_COMPLETIONS}/${taskId}/completions`,
        {
          timestamp,
          units,
          staffId,
          metadata,
        }
      )

      if (!data) {
        throw new Error('No se pudo registrar el progreso.')
      }

      return data
    },
  })
}
