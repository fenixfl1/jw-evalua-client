import { useMutation } from '@tanstack/react-query'
import { API_PATH_OPERATOR_TASK_COMPLETIONS } from 'src/constants/routes'
import { buildQueryString, deleteRequest } from '../api'
import { OperatorResetResponse } from './operators.types'

interface ResetPayload {
  taskId: number
  date: string
}

export function useResetOperatorTaskMutation(date: string) {
  return useMutation<OperatorResetResponse, Error, Omit<ResetPayload, 'date'>>({
    mutationKey: ['operator', 'tasks', 'reset', date],
    mutationFn: async ({ taskId }) => {
      const url = buildQueryString(
        `${API_PATH_OPERATOR_TASK_COMPLETIONS}/${taskId}/completions`,
        { date }
      )

      const {
        data: { data },
      } = await deleteRequest<OperatorResetResponse>(url)

      if (!data) {
        throw new Error('No se pudo reiniciar la tarea seleccionada.')
      }

      return data
    },
  })
}
