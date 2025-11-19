export interface OperatorTask {
  id: number
  name: string
  description: string | null
  unitLabel: string
  goalPerHour: number | null
  color: string
  target: number
  goalId: number
  goalModuleId: number | null
  moduleId: number | null
  period: number | null
}

export interface OperatorHistoryEntry {
  id: number
  taskId: number
  timestamp: string
  units: number
}

export interface OperatorDashboardResponse {
  date: string
  period: number
  tasks: OperatorTask[]
  totals: Record<string, number>
  history: OperatorHistoryEntry[]
}

export interface OperatorCompletionResponse {
  completion: OperatorHistoryEntry
  totalForTask: number
}

export interface OperatorResetResponse {
  taskId: number
  totalForTask: number
  removedEntryIds: number[]
}
