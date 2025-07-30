export interface MenuOption {
  CHILDREN?: MenuOption[]
  CONTENT?: string
  DESCRIPTION?: string
  ICON?: string
  MENU_OPTION_ID: string
  NAME: string
  PARENT_ID?: string
  PATH: string
  TYPE?: 'link' | 'divider' | 'group' | 'item' | 'submenu'
}
