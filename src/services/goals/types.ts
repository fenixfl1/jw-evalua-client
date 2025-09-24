export interface Goal {
  GOAL_ID: number
  MODULE_ID: number
  DESCRIPTION: string
  START_DATE: string
  END_DATE: string
  WEIGHT: number
  SCOPE: 'individual' | 'module'
}

export interface CreateGoalPayload {
  MODULE_ID?: number
  DESCRIPTION: string
  START_DATE: string
  END_DATE: string
  WEIGHT: number
  SCOPE: 'individual' | 'module'
}

export interface AssignGoalToModulePayload {
  GOAL_ID: number
  MODULE_ID: number
  PERIOD: number
  TARGET_VALUE: number
}

export interface PostGoalProgressPayload {
  GOAL_ID: number
  SCOPE: 'individual' | 'module'
  PERIOD: number
  ACTUAL_VALUE: number
  MODULE_ID?: number
  STAFF_ID?: number
}

export interface ModuleSummaryDetail {
  GOAL_ID: number
  TARGET_VALUE: number
  ACTUAL_VALUE: number
  WEIGHT: number
  COMPLIANCE: number
  UPDATED_AT?: string
  DESCRIPTION?: string
  PERIOD?: number
  STATE?: string
  MODULE_ID?: number
}

export interface ModuleSummary {
  MODULE_ID: number
  PERIOD: number
  TOTAL_COMPLIANCE: number
  DETAILS: ModuleSummaryDetail[]
}
