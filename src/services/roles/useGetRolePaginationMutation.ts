import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { Role } from './role.type'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_ROLE_PAGINATION } from 'src/constants/routes'
import { useRoleStore } from 'src/store/role.store'

const initialData = {
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

export function useGetRolePaginationMutation() {
  const { setRoleList } = useRoleStore()

  return useCustomMutation<ReturnPayload<Role>, GetPayload<Role>>({
    initialData,
    mutationKey: ['roles', 'get-role-pagination'],
    onSuccess: setRoleList,
    onError: () => setRoleList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<ReturnPayload<Role>>(
        getQueryString(API_PATH_GET_ROLE_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
