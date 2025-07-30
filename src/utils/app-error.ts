export class AppError extends Error {
  code: string
  type?: 'warning' | 'error' | 'info' | 'success'
  mode?: 'modal' | 'notification'
  meta?: Record<string, unknown>

  constructor(
    message: string,
    options?: {
      code?: string
      type?: 'warning' | 'error' | 'info' | 'success'
      mode?: 'modal' | 'notification'
      meta?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options?.code || 'APP_UNKNOWN'
    this.type = options?.type || 'error'
    this.mode = options?.mode
    this.meta = options?.meta
  }
}
