import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_GOAL_SUMMARY_MODULE_PAGINATION } from 'src/constants/routes'
import { ModuleSummaryDetail } from './types'
import { useGoalStore } from 'src/store/goal.store'

const initialData: ReturnPayload<ModuleSummaryDetail> = {
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

export function useGetModuleSummaryPaginationMutation() {
  const { setModuleSummary } = useGoalStore()

  return useCustomMutation<
    ReturnPayload<ModuleSummaryDetail>,
    GetPayload<ModuleSummaryDetail>
  >({
    initialData,
    mutationKey: ['goals', 'get-module-summary'],
    onSuccess: setModuleSummary,
    onError: () => setModuleSummary(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ModuleSummaryDetail[]>(
        getQueryString(API_PATH_GET_GOAL_SUMMARY_MODULE_PAGINATION, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
