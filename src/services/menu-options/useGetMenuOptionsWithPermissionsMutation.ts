import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { OptionWithPermission } from './menu-options.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_MENU_OPTIONS_WITH_PERMISSIONS } from 'src/constants/routes'
import { useMenuOptionStore } from 'src/store/menu-options.store'

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
export function useGetMenuOptionsWithPermissions() {
  const { setMenuOptionWithPermission } = useMenuOptionStore()

  return useCustomMutation<ReturnPayload<OptionWithPermission>, GetPayload>({
    initialData,
    mutationKey: ['menu-options', 'get-menu-options-with-permissions'],
    onSuccess: (resp) => setMenuOptionWithPermission(resp.data),
    onError: () => setMenuOptionWithPermission(initialData.data),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<OptionWithPermission[]>(
        getQueryString(API_PATH_GET_MENU_OPTIONS_WITH_PERMISSIONS, {
          page,
          size,
        }),
        condition
      )

      return data || initialData
    },
  })
}
