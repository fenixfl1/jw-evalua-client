import { Metadata } from 'src/types/general'

export interface DashboardSummaryFilters {
  moduleId?: number | null
  periodStart?: number | null
  periodEnd?: number | null
}

export interface DashboardKpis {
  totalStaff: number
  activeModules: number
  newStaffLast30Days: number
  evaluationsCompleted: number
  evaluationsPending: number
  evaluationsAverageScore: number | null
  activeGoals: number
  goalComplianceAverage: number | null
}

export interface EvaluationTrendPoint {
  period: number
  label: string
  total: number
  completed: number
  pending: number
  averageScore: number | null
  lastUpdatedAt: string | null
}

export interface ModuleEvaluationSummary {
  moduleId: number | null
  moduleName: string
  total: number
  completed: number
  pending: number
  averageScore: number | null
}

export interface ModuleGoalCompliance {
  moduleId: number | null
  moduleName: string
  targetValue: number
  actualValue: number
  compliance: number | null
}

export interface StaffDistributionEntry {
  moduleId: number | null
  moduleName: string
  staffCount: number
}

export interface RecentEvaluation {
  evaluationId: number
  staffName: string | null
  moduleName: string
  period: number
  periodLabel: string
  overallScore: number | null
  updatedAt: string | null
}

export interface DashboardFilterOptions {
  modules: { moduleId: number; description: string }[]
  periods: number[]
}

export interface DashboardSummaryResponse {
  kpis: DashboardKpis
  evaluationsTrend: EvaluationTrendPoint[]
  evaluationsByModule: ModuleEvaluationSummary[]
  goalComplianceByModule: ModuleGoalCompliance[]
  staffDistribution: StaffDistributionEntry[]
  recentEvaluations: RecentEvaluation[]
  filters: DashboardFilterOptions
}

export interface ActivityLogEntry {
  id: number
  action: string
  model: string
  objectId: unknown
  changes: Record<string, unknown> | null
  createdAt: string
  userId: number | null
  username: string | null
  staffName: string | null
}

export interface DashboardActivityFilters {
  limit?: number
  offset?: number
  action?: 'INSERT' | 'UPDATE' | 'DELETE'
  model?: string
  userId?: number
  dateFrom?: string
  dateTo?: string
}

export interface DashboardActivityResponse {
  items: ActivityLogEntry[]
  metadata: { pagination: Metadata }
}
