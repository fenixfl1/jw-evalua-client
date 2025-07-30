import { MenuOption } from 'src/services/menu-options/menu-options.types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UseMenuOptionStore {
  currenMenuOption: MenuOption
  menuOptions: MenuOption[]
  selectedKeys: string[]
  openKeys: string[]
  setSelectedKeys: (keys: string[]) => void
  setOpenKeys: (keys: string[]) => void
  setMenuOptions: (options: MenuOption[]) => void
  setCurrentMenuOption: (option: MenuOption) => void
  reset: () => void
}

const initialValue = {
  currenMenuOption: <MenuOption>{},
  menuOptions: [],
  selectedKeys: [],
  openKeys: [],
}

export const useMenuOptionStore = create(
  persist<UseMenuOptionStore>(
    (set) => ({
      ...initialValue,
      setOpenKeys: (openKeys) => set({ openKeys }),
      setSelectedKeys: (selectedKeys) => set({ selectedKeys }),
      setMenuOptions: (menuOptions) => set({ menuOptions }),
      setCurrentMenuOption: (currenMenuOption) => set({ currenMenuOption }),
      reset: () => set({ ...initialValue }),
    }),
    { name: 'menu-options' }
  )
)
