import { Staff } from '../staff/staff.types'

export interface WorkModule {
  MODULE_ID: number
  DESCRIPTION: string
  SUPERVISOR_ID: number
  STATE: string
  CREATED_AT: string
  CREATED_BY: number
  MEMBERS: Pick<Staff, 'STAFF_ID' | 'NAME' | 'LAST_NAME'>[]
}

export interface CreateModulePayload {
  DESCRIPTION: number
  SUPERVISOR_ID: number
  MEMBERS: number[]
}

export interface UpdateModulePayload {
  MODULE_ID: number
  DESCRIPTION?: string
  SUPERVISOR_ID?: number
  STATE: string
}

export interface ModuleMemberPayload {
  MODULE_ID: number
  MEMBERS: {
    STAFF_ID: number
    STATE: string
  }[]
}
