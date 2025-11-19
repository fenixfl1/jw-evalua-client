export const PATH_HOME = '/'
export const PATH_DASHBOARD =
  '/' + import.meta.env.VITE_INITIAL_ACTIVITY_ID + '/dashboard'
export const PATH_OPERATORS = '/operators'
export const PATH_CONSOLE = 'console'
export const PATH_APPS = 'services'
export const PATH_SETTING = 'settings'
export const PATH_LOGIN = '/login'
export const PATH_MODULE_GOALS = 'goals/:module'

// external routes
export const BASE_API_PATH = import.meta.env?.VITE_APP_API_SERVICE_URL
export const API_PATH_GET_REPOSITORIES = '/repositories'
export const API_PATH_CLONE_REPOSITORY = '/repositories/clone'
export const API_PATH_GET_TAG_LIST = '/get_tags/'
export const API_PATH_CHECKOUT = '/checkout'
export const API_PATH_LOGIN = '/login'
export const API_PATH_REQUEST_RESET_PASSWORD = '/request_password_reset'
export const API_PATH_RESET_PASSWORD = '/reset_password'
export const API_PATH_GET_USER_MENU_OPTION = '/menu_options/'
export const API_PATH_GET_MENU_OPTIONS_WITH_PERMISSIONS =
  '/menu_options/get_with_permission'
export const API_GET_STAFF_PAGINATION = '/staff/pagination'
export const API_PATH_CREATE_UPDATE_STAFF = '/staff'
export const API_PATH_GET_USER_PAGINATION = '/user/pagination'
export const API_PATH_GET_ONE_STAFF = '/staff/'
export const API_PATH_VALIDATE_IDENTITY_DOCUMENT = '/staff/identity/validate'
export const API_PATH_CREATE_UPDATE_ROLE = '/role'
export const API_PATH_GET_ONE_ROLE = '/role/'
export const API_PATH_GET_ROLE_PAGINATION = '/role/pagination'
export const API_PATH_CREATE_UPDATE_USER = '/user'
export const API_PATH_GET_USER = '/user/'
export const API_PATH_CHANGE_PASSWORD = '/user/change_password'
export const API_PATH_GET_MODULE_PAGINATION = '/module/pagination'
export const API_PATH_CREATE_UPDATE_MODULE = '/module'
export const API_PATH_GET_MODULE_MEMBERS = '/module/get_members'
export const API_PATH_CREATE_OR_UPDATE_MODULE_MEMBERS = '/module/members'
// goals
export const API_PATH_CREATE_UPDATE_GOAL = '/goal'
export const API_PATH_ASSIGN_GOAL_STAFF = '/goal/assign/staff'
export const API_PATH_ASSIGN_GOAL_MODULE = '/goal/assign/module'
export const API_PATH_POST_GOAL_PROGRESS = '/goal/progress'
export const API_PATH_GET_GOAL_PAGINATION = '/goal/pagination'
export const API_PATH_GET_GOAL_SUMMARY_STAFF = '/goal/summary/staff/'
export const API_PATH_GET_GOAL_SUMMARY_MODULE = '/goal/summary/module/'
export const API_PATH_GET_GOAL_SUMMARY_MODULE_PAGINATION =
  '/goal/summary/module/pagination'
export const API_PATH_GET_GOALS_BY_MODULE = '/goal/module/'
export const API_PATH_GET_GOAL_MODULE_TASKS = '/goal/module'
export const API_PATH_POST_MODULE_EFFICIENCY = '/module/efficiency'
export const API_PATH_GET_MODULE_EFFICIENCY = '/module/:moduleId/efficiency'
export const API_PATH_GET_MODULE_WORKED_MINUTES =
  '/module/:moduleId/efficiency/worked-minutes'
export const API_PATH_POST_PROCESS_AUDIT = '/audits/process'
export const API_PATH_GET_PROCESS_AUDIT = '/audits/process'

// competencies
export const API_PATH_GET_COMPETENCIES = '/competency'

// evaluations
export const API_PATH_CREATE_EVALUATION = '/evaluation'
export const API_PATH_UPDATE_EVALUATION = '/evaluation/'
export const API_PATH_GET_EVALUATION = '/evaluation/'
export const API_PATH_GET_EVALUATION_PAGINATION = '/evaluation/pagination'
export const API_PATH_CHECK_EVALUATION_AVAILABILITY = '/evaluation/availability'

// dashboard
export const API_PATH_GET_DASHBOARD_SUMMARY = '/dashboard/summary'
export const API_PATH_GET_DASHBOARD_ACTIVITY = '/dashboard/activity'
export const API_PATH_GET_OPERATOR_DASHBOARD = '/operator/dashboard'
export const API_PATH_OPERATOR_TASK_COMPLETIONS = '/operator/tasks'
export const API_PATH_OPERATOR_TASK_SESSION = '/operator/tasks'
export const API_PATH_GET_WORKED_HOURS_BY_MODULE =
  '/dashboard/worked-hours/modules'
export const API_PATH_GET_WORKED_HOURS_BY_STAFF =
  '/dashboard/worked-hours/staff'
