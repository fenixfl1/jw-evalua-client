import { PATH_DASHBOARD, PATH_OPERATORS } from 'src/constants/routes'

const roleHomeMap: Record<string, string> = {
  '3': PATH_OPERATORS,
}

export function getHomePathByRole(roleId?: string | number): string {
  if (roleId === undefined || roleId === null) {
    return PATH_DASHBOARD
  }

  const normalizedRoleId = String(roleId)

  return roleHomeMap[normalizedRoleId] ?? PATH_DASHBOARD
}
