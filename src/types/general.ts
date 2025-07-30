import { AxiosError, AxiosResponse } from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type LoaderReturnType<T = string> = Record<string, T>

export type ErroMessageMode = 'notification' | 'modal'

export interface Metadata {
  currentPage: number
  totalPages: number
  totalRows: number
  count: number
  pageSize: number
  links?: {
    nextPage?: string
    previousPage?: string
    first?: string
    previous?: string
    next?: string
    last?: string
  }
}

export interface PageMetadata {
  title?: string
  public?: boolean
  layout?: string
  loader?: () => Promise<unknown>
  path?: string
}

export type AnyType = any

export type TriggersType = {
  onBlur?: unknown
  onChange?: unknown
  onClick?: unknown
  onFinish?: unknown
  onFocus?: unknown
  onPress?: unknown
  onPressEnter?: unknown
  onReset?: unknown
  onSearch?: unknown
  onSelect?: unknown
  onSubmit?: unknown
  onTab?: unknown
}

export interface ConsoleMessage {
  project: string
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'error' | 'start' | 'done'
  message: string
  timestamp: string
}

export interface ErrorResponse<T = unknown, D = any>
  extends Omit<AxiosError<T, D>, 'response'> {
  response?: Omit<AxiosResponse<D>, 'data'> & {
    data: {
      message: string
      error: ErrorName
      errorCode?: string
    }
  }
}

export type ErrorName =
  | 'UnexpectedError'
  | 'DataNotFound'
  | 'PayloadValidationError'
  | 'DbUpdateError'
  | 'DbInsertError'
  | 'EntityNotFound'
  | 'E002'
  | 'InternalError'
  | 'RangeError'
  | 'ReferenceError'
  | 'SyntaxError'
  | 'TypeError'
  | 'ValidationError'
  | 'CustomUnexpectedError'
  | 'DbConflictError'
  | 'NotFoundError'
  | 'DataCloneError'
  | 'InvalidCredentials'

export type ErrorCode =
  | 'BE001'
  | 'BE002'
  | 'BE003'
  | 'BE004'
  | 'BE005'
  | 'BE006'
  | 'BE007'
  | 'BE008'
  | 'BE009'
  | 'FE001'
  | 'FE002'
  | 'FE003'
  | 'FE004'
  | 'FE005'
  | 'FE006'
  | 'FE007'
  | 'FE008'
  | 403
  | 401

export interface AdvancedCondition<T = any> {
  value: string | number | boolean | (string | number)[]
  field: keyof T | (keyof T)[]
  operator: string
}

export interface ReturnPayload<T> {
  data: T[]
  metadata: { pagination: Metadata }
}

export interface GetPayload<T = unknown> {
  condition: AdvancedCondition<T>[]
  page: number
  size: number
}
