export interface Goal {
  GOAL_ID: number
  MODULE_ID: number
  DESCRIPTION: string
  START_DATE: string
  END_DATE: string
  WEIGHT: number
  STATE: string
  SCOPE: 'individual' | 'module'
  TARGET_VALUE: number
}

export interface CreateGoalPayload {
  MODULE_ID?: number
  DESCRIPTION: string
  START_DATE: string
  END_DATE: string
  WEIGHT: number
  SCOPE: 'individual' | 'module'
  DAILY_TARGETS?: GoalDailyTargetPayload[]
}

export interface AssignGoalToModulePayload {
  GOAL_ID: number
  MODULE_ID: number
  PERIOD: number
  TARGET_VALUE: number
  DAILY_TARGETS?: GoalDailyTargetPayload[]
  TASKS: GoalTaskAssignmentPayload[]
}

export interface GoalProgressContribution {
  STAFF_ID: number
  ACTUAL_VALUE: number
}

export interface PostGoalProgressPayload {
  GOAL_ID: number
  SCOPE: 'individual' | 'module'
  PERIOD: number
  ACTUAL_VALUE: number
  MODULE_ID?: number
  STAFF_ID?: number
  CONTRIBUTIONS?: GoalProgressContribution[]
}

export interface GoalDailyTargetPayload {
  TARGET_DATE: string
  TARGET_VALUE: number
  TARGET_TIME?: string
}

export interface GoalTaskStaffAssignmentPayload {
  STAFF_ID: number
  TARGET: number
}

export interface GoalTaskAssignmentPayload {
  DESCRIPTION: string
  COMMENT?: string
  TARGET: number
  UNITS_PER_ITEM?: number
  STAFF: GoalTaskStaffAssignmentPayload[]
}

export interface ModuleTaskAssignee {
  staffId: number
  staffName: string
  target: number
  completed: number
}

export interface ModuleTaskSummary {
  goalTaskId: number
  description: string
  comment: string | null
  target: number
  completedUnits: number
  unitsPerItem?: number
  assignees: ModuleTaskAssignee[]
}

export interface ModuleSummaryDetail {
  GOAL_ID: number
  TARGET_VALUE: number
  ACTUAL_VALUE: number
  WEIGHT: number
  COMPLIANCE: number
  UPDATED_AT?: string | null
  DESCRIPTION?: string
  STATE?: string
  PROGRESS_LOGS?: GoalProgressLog[]
  DAILY_TARGETS?: GoalDailyTargetPayload[]
  TARGET_DATE: string
  TARGET_VALUE_ACC: number
  ACTUAL_VALUE_ACC: number
  TASKS?: ModuleTaskSummary[]
}

export interface ModuleSummary {
  MODULE_ID: number
  PERIOD: number
  TOTAL_COMPLIANCE: number
  DETAILS: ModuleSummaryDetail[]
}

export interface GoalProgressLog {
  GOAL_PROGRESS_ID: number
  ACTUAL_VALUE: number
  CREATED_AT: string | null
  UPDATED_AT: string | null
}
