import { useQuery } from '@tanstack/react-query'
import {
  API_PATH_CHECK_EVALUATION_AVAILABILITY,
} from 'src/constants/routes'
import { buildQueryString, getRequest } from '../api'

export interface EvaluationAvailabilityResponse {
  available: boolean
  evaluation: {
    EVALUATION_ID: number
    MODULE_ID: number
    STAFF_ID: number
    PERIOD: number
  } | null
}

type UseCheckEvaluationAvailabilityQueryParams = {
  staffId?: number
  period?: number
  excludeEvaluationId?: number
  enabled?: boolean
}

export function useCheckEvaluationAvailabilityQuery({
  staffId,
  period,
  excludeEvaluationId,
  enabled = true,
}: UseCheckEvaluationAvailabilityQueryParams) {
  return useQuery({
    queryKey: [
      'evaluations',
      'availability',
      staffId,
      period,
      excludeEvaluationId,
    ],
    enabled: enabled && !!staffId && !!period,
    queryFn: async () => {
      const url = buildQueryString(API_PATH_CHECK_EVALUATION_AVAILABILITY, {
        staffId,
        period,
        excludeEvaluationId,
      })

      const {
        data: { data },
      } = await getRequest<EvaluationAvailabilityResponse>(url)

      return data
    },
  })
}
