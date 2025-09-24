import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_EVALUATION_PAGINATION } from 'src/constants/routes'
import { Evaluation } from './evaluation.types'
import { useEvaluationStore } from 'src/store/evaluation.store'

const initialData: ReturnPayload<Evaluation> = {
  data: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: 15,
      links: undefined,
    },
  },
}

export function useGetEvaluationPaginationMutation() {
  const { setEvaluations, resetEvaluations } = useEvaluationStore()

  return useCustomMutation<ReturnPayload<Evaluation>, GetPayload>({
    initialData,
    mutationKey: ['evaluations', 'get-pagination'],
    onSuccess: setEvaluations,
    onError: () => resetEvaluations(),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<Evaluation[]>(
        getQueryString(API_PATH_GET_EVALUATION_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
