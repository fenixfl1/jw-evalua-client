import { useQuery } from '@tanstack/react-query'
import { buildQueryString, getRequest } from 'src/services/api'
import { API_PATH_GET_PROCESS_AUDIT } from 'src/constants/routes'

export interface ProcessAuditRecord {
  PROCESS_AUDIT_ID: number
  MODULE_ID: number
  AUDIT_DATE: string
  SHIFT?: string | null
  STYLE?: string | null
  SUPERVISOR?: string | null
  AUDITOR?: string | null
  ENTRIES: Record<string, any>[]
  COMMENTS?: string | null
  CREATED_AT: string
}

export function useGetProcessAuditsQuery(
  moduleId?: number,
  startDate?: string,
  endDate?: string
) {
  return useQuery<ProcessAuditRecord[] | undefined>({
    enabled: Number.isFinite(moduleId),
    queryKey: ['production', 'audits', moduleId, startDate, endDate],
    queryFn: async () => {
      const url = buildQueryString(API_PATH_GET_PROCESS_AUDIT, {
        moduleId,
        startDate,
        endDate,
      })
      const {
        data: { data },
      } = await getRequest<ProcessAuditRecord[]>(url)
      return data ?? []
    },
  })
}
