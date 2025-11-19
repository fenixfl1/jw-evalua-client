import { useMutation } from '@tanstack/react-query'
import { postRequest } from 'src/services/api'
import { API_PATH_POST_PROCESS_AUDIT } from 'src/constants/routes'

export interface ProcessAuditEntryPayload {
  operation?: string
  operator?: string
  timeSlot?: string
  samples?: number
  defects?: { type: string; count: number }[]
  comments?: string
}

export interface CreateProcessAuditPayload {
  MODULE_ID: number
  AUDIT_DATE: string
  SHIFT?: string
  STYLE?: string
  SUPERVISOR?: string
  AUDITOR?: string
  COMMENTS?: string
  ENTRIES: ProcessAuditEntryPayload[]
}

export function useCreateProcessAuditMutation() {
  return useMutation({
    mutationKey: ['production', 'audit', 'create'],
    mutationFn: async (payload: CreateProcessAuditPayload) => {
      const {
        data: { data },
      } = await postRequest(API_PATH_POST_PROCESS_AUDIT, payload)
      return data
    },
  })
}
