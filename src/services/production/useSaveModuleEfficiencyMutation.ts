import { useMutation } from '@tanstack/react-query'
import { postRequest } from 'src/services/api'
import { API_PATH_POST_MODULE_EFFICIENCY } from 'src/constants/routes'

export interface ModuleEfficiencyPayload {
  MODULE_ID: number
  PERIOD: number
  TOTAL_UNITS: number
  SAM: number
  MINUTES_WORKED: number
  NOTES?: string
}

export interface ModuleEfficiencyRecord extends ModuleEfficiencyPayload {
  MODULE_EFFICIENCY_ID: number
  EFFICIENCY_PERCENT: number
  CREATED_AT: string
}

export function useSaveModuleEfficiencyMutation() {
  return useMutation<ModuleEfficiencyRecord, Error, ModuleEfficiencyPayload>({
    mutationKey: ['production', 'efficiency', 'save'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<ModuleEfficiencyRecord>(
        API_PATH_POST_MODULE_EFFICIENCY,
        payload
      )

      if (!data) {
        throw new Error('No se pudo registrar la eficiencia.')
      }

      return data
    },
  })
}
