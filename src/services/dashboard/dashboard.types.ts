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
  targetTime: number
  actualTime: number
  timeEfficiency: number | null
  timeVariance: number
  goalsAssigned: number
  goalsCompleted: number
  completionRate: number | null
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

export interface ModuleTopPerformer {
  moduleId: number | null
  moduleName: string
  staffId: number | null
  staffName: string | null
  averageScore: number | null
  evaluationsCompleted: number
  lastEvaluationAt: string | null
  rank: number
}

export interface GoalProductivityModule {
  moduleId: number | null
  moduleName: string
  totalGoals: number
  completedGoals: number
  completionRate: number | null
  goalsOnTime: number
  goalsLate: number
  goalsInProgress: number
  goalsPending: number
  timeEfficiency: number | null
  averageTargetTime: number | null
  averageActualTime: number | null
  averageTimeVariance: number | null
}

export interface GoalProductivityTrendPoint {
  period: number | null
  periodLabel: string
  totalGoals: number
  completedGoals: number
  completionRate: number | null
  targetValue: number
  actualValue: number
  targetTime: number
  actualTime: number
  averageTargetTime: number | null
  averageActualTime: number | null
}

export interface GoalProductivityTotals {
  totalGoals: number
  completedGoals: number
  completionRate: number | null
  averageTargetTime: number | null
  averageActualTime: number | null
  averageTimeVariance: number | null
  totalTargetValue: number
  totalActualValue: number
  totalTargetTime: number
  totalActualTime: number
}

export interface GoalTimeInsights {
  completedOnTime: number
  completedLate: number
  completedAhead: number
  inProgress: number
  notStarted: number
  averageTimeVariance: number | null
  averageTargetTime: number | null
  averageActualTime: number | null
}

export interface EmployeeProductivityEntry {
  staffId: number | null
  staffName: string
  modules: string[]
  assignedGoals: number
  completedGoals: number
  completionRate: number | null
  completedOnTime: number
  completedLate: number
  inProgressGoals: number
  pendingGoals: number
  totalTargetTime: number
  totalActualTime: number
  totalTargetValue: number
  totalActualValue: number
  averageTargetTime: number | null
  averageActualTime: number | null
  averageTimeVariance: number | null
  efficiency: number | null
}

export interface GoalProductivityMetrics {
  totals: GoalProductivityTotals
  byModule: GoalProductivityModule[]
  byPeriod: GoalProductivityTrendPoint[]
  timeInsights: GoalTimeInsights
  employees: EmployeeProductivityEntry[]
}

export interface DashboardDailySummary {
  date: string
  targetValue: number
  actualValue: number
  completionRate: number | null
  targetTime: number | null
  actualTime: number | null
  timeVariance: number | null
  activeGoals: number
  completedGoals: number
  evaluationsCompleted: number
  activityCount: number
}

export interface DashboardSummaryResponse {
  kpis: DashboardKpis
  evaluationsTrend: EvaluationTrendPoint[]
  evaluationsByModule: ModuleEvaluationSummary[]
  goalComplianceByModule: ModuleGoalCompliance[]
  staffDistribution: StaffDistributionEntry[]
  recentEvaluations: RecentEvaluation[]
  filters: DashboardFilterOptions
  goalProductivity: GoalProductivityMetrics
  moduleTopPerformers: ModuleTopPerformer[]
  dailySummary: DashboardDailySummary
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
