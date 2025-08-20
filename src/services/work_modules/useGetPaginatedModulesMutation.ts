import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { WorkModule } from './module.types'
import { getQueryString, postRequest } from '../api'
import { useModuleStore } from 'src/store/module.store'
import { API_PATH_GET_MODULE_PAGINATION } from 'src/constants/routes'

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

export function useGetPaginatedModulesMutation() {
  const { setWorkModules } = useModuleStore()

  return useCustomMutation<ReturnPayload<WorkModule>, GetPayload<WorkModule>>({
    initialData,
    mutationKey: ['modules', 'get-paginated-module'],
    onSuccess: setWorkModules,
    onError: () => setWorkModules(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<WorkModule[]>(
        getQueryString(API_PATH_GET_MODULE_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
