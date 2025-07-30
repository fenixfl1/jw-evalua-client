export const PATH_HOME = '/'
export const PATH_DASHBOARD =
  '/' + import.meta.env.VITE_INITIAL_ACTIVITY_ID + '/dashboard'
export const PATH_CONSOLE = 'console'
export const PATH_APPS = 'services'
export const PATH_SETTING = 'settings'
export const PATH_LOGIN = '/login'

// external routes
export const BASE_API_PATH = import.meta.env?.VITE_APP_API_SERVICE_URL
export const API_PATH_GET_REPOSITORIES = '/repositories'
export const API_PATH_CLONE_REPOSITORY = '/repositories/clone'
export const API_PATH_GET_TAG_LIST = '/get_tags/'
export const API_PATH_CHECKOUT = '/checkout'
export const API_PATH_LOGIN = '/login'
export const API_PATH_GET_USER_MENU_OPTION = '/menu_options/'
export const API_GET_STAFF_PAGINATION = '/staff/pagination'
export const API_PATH_CREATE_UPDATE_STAFF = '/staff'
export const API_PATH_GET_USER_PAGINATION = '/user/pagination'
export const API_PATH_GET_ROLE_PAGINATION = '/role/pagination'
export const API_PATH_CREATE_UPDATE_USER = '/user'
