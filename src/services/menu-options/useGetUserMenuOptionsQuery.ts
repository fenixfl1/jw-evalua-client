import { useQuery } from '@tanstack/react-query'
import { getSessionInfo } from 'src/lib/session'
import { getRequest } from '../api'
import { API_PATH_GET_USER_MENU_OPTION } from 'src/constants/routes'
import { MenuOption } from './menu-options.types'
import { useMenuOptionStore } from 'src/store/menu-options.store'

export function useGetUserMenuOptionsQuery() {
  const { menuOptions, setMenuOptions } = useMenuOptionStore()
  const { username } = getSessionInfo()

  return useQuery({
    initialData: [],
    enabled: !menuOptions.length,
    queryKey: ['menu-options', 'get-user-menu-options', username],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<MenuOption[]>(
        API_PATH_GET_USER_MENU_OPTION + username
      )

      setMenuOptions(data)

      return data
    },
  })
}
