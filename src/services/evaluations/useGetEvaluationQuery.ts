import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_EVALUATION } from 'src/constants/routes'
import { useEvaluationStore } from 'src/store/evaluation.store'
import { EvaluationWithDetails } from './evaluation.types'

export function useGetEvaluationQuery(evaluationId?: number) {
  const { setSelectedEvaluation } = useEvaluationStore()

  return useQuery<EvaluationWithDetails>({
    enabled: !!evaluationId,
    queryKey: ['evaluations', 'get-evaluation', evaluationId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<EvaluationWithDetails>(
        `${API_PATH_GET_EVALUATION}${evaluationId}`
      )

      setSelectedEvaluation(data)
      return data
    },
  })
}
