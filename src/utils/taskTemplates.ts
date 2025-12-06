import { GoalTaskTemplate } from 'src/services/goals/types'

export interface AssignmentTaskFormValue {
  DESCRIPTION: string
  COMMENT?: string | null
  TARGET: number
  UNITS_PER_ITEM: number
  STAFF: { STAFF_ID?: number; TARGET?: number }[]
}

export const buildAssignmentTasksFromTemplates = (
  templates?: GoalTaskTemplate[]
): AssignmentTaskFormValue[] => {
  if (!Array.isArray(templates) || !templates.length) {
    return []
  }

  return templates
    .map((template) => {
      const description = String(template?.DESCRIPTION ?? '').trim()
      const comment =
        typeof template?.COMMENT === 'string'
          ? template.COMMENT?.trim()
          : undefined
      const target = Number(template?.TARGET ?? 0)
      const unitsRaw = Number(template?.UNITS_PER_ITEM ?? 1)

      return {
        DESCRIPTION: description,
        COMMENT: comment || undefined,
        TARGET: Number.isFinite(target) ? Math.round(target) : 0,
        UNITS_PER_ITEM:
          Number.isFinite(unitsRaw) && unitsRaw > 0 ? Number(unitsRaw) : 1,
        STAFF: [{}],
      }
    })
    .filter((task) => task.DESCRIPTION && task.TARGET > 0)
}

