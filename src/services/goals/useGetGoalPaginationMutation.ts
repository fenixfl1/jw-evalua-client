import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_GOAL_PAGINATION } from 'src/constants/routes'
import { Goal } from './types'
import { useGoalStore } from 'src/store/goal.store'

const initialData = {
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

export function useGetGoalPaginationMutation() {
  const { setGoals } = useGoalStore()

  return useCustomMutation<ReturnPayload<Goal>, GetPayload<Goal>>({
    initialData,
    mutationKey: ['goals', 'get-goals-pagination'],
    onSuccess: setGoals,
    onError: () => setGoals(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<Goal[]>(
        getQueryString(API_PATH_GET_GOAL_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data
    },
  })
}
