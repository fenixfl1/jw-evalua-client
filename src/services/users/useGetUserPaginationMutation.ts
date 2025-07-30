import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { User } from './users.types'
import { getQueryString, postRequest } from '../api'
import { useUserStore } from 'src/store/user.store'
import { API_PATH_GET_USER_PAGINATION } from 'src/constants/routes'

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

export function useGetUserPaginationMutation() {
  const { setUserList } = useUserStore()

  return useCustomMutation<ReturnPayload<User>, GetPayload<User>>({
    initialData,
    mutationKey: ['users', 'get-user-pagination'],
    onSuccess: setUserList,
    onError: () => setUserList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ReturnPayload<User>>(
        getQueryString(API_PATH_GET_USER_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
