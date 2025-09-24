export interface EvaluationDetailPayload {
  COMPETENCY_ID: number
  GOAL_ID?: number | null
  WEIGHT?: number | null
  SCORE?: number | null
  COMMENT?: string | null
  EVALUATION_DETAIL_ID?: number
  _ACTION?: 'create' | 'update' | 'delete'
}

export interface EvaluationDetail extends Omit<EvaluationDetailPayload, '_ACTION'> {
  EVALUATION_DETAIL_ID: number
  EVALUATION_ID: number
  COMPETENCY?: {
    COMPETENCY_ID: number
    NAME: string
    DESCRIPTION?: string | null
    WEIGHT?: number | null
  }
}

export interface Evaluation {
  EVALUATION_ID: number
  MODULE_ID: number
  MODULE_NAME?: string
  STAFF_ID: number
  STAFF_NAME?: string
  EVALUATOR_ID?: number | null
  EVALUATOR_NAME?: string | null
  GOAL_ID?: number | null
  GOAL_DESCRIPTION?: string | null
  GOAL_STAFF_ID?: number | null
  PERIOD: number
  OVERALL_SCORE?: number | null
  COMMENTS?: string | null
  STATE: 'A' | 'I'
  CREATED_AT: string
  UPDATED_AT: string
}

export interface CreateEvaluationPayload {
  MODULE_ID: number
  STAFF_ID: number
  EVALUATOR_ID?: number | null
  GOAL_ID?: number | null
  GOAL_STAFF_ID?: number | null
  PERIOD: number
  OVERALL_SCORE?: number | null
  COMMENTS?: string | null
  DETAILS: EvaluationDetailPayload[]
}

export interface UpdateEvaluationPayload {
  MODULE_ID?: number
  STAFF_ID?: number
  EVALUATOR_ID?: number | null
  GOAL_ID?: number | null
  GOAL_STAFF_ID?: number | null
  PERIOD?: number
  OVERALL_SCORE?: number | null
  COMMENTS?: string | null
  STATE?: 'A' | 'I'
  DETAILS?: EvaluationDetailPayload[]
}

export interface EvaluationWithDetails extends Evaluation {
  DETAILS: EvaluationDetail[]
}
