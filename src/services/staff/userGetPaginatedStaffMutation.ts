import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { Staff } from './staff.types'
import { buildQueryString, postRequest } from '../api'
import { API_GET_STAFF_PAGINATION } from 'src/constants/routes'
import { useStaffStore } from 'src/store/staff.store'

const initialData: ReturnPayload<Staff> = {
  data: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: 0,
      links: undefined,
    },
  },
}

export function useGetPaginatedStaffMutation() {
  const { setStaffList } = useStaffStore()

  return useCustomMutation<ReturnPayload<Staff>, GetPayload<Staff>>({
    initialData,
    mutationKey: ['staff', 'get-paginated-staff'],
    onSuccess: setStaffList,
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ReturnPayload<Staff>>(
        buildQueryString(API_GET_STAFF_PAGINATION, { page }, { size }),
        condition
      )

      return data || initialData
    },
  })
}
