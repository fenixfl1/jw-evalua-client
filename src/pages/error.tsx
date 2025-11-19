import React from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import Forbidden from './403'
import NotFound from './404'
import InternalServerError from './500'
import type {
  ErrorStatusCode,
  StatusErrorPageProps,
} from './error-page-layout'
import { AppError } from 'src/utils/app-error'

const ERROR_COMPONENTS: Record<
  ErrorStatusCode,
  React.FC<StatusErrorPageProps>
> = {
  '403': Forbidden,
  '404': NotFound,
  '500': InternalServerError,
}

const DEFAULT_STATUS: ErrorStatusCode = '500'

const RouteErrorElement = () => {
  const error = useRouteError()
  const status = getStatusFromError(error) ?? DEFAULT_STATUS
  const Component = ERROR_COMPONENTS[status] ?? ERROR_COMPONENTS[DEFAULT_STATUS]

  return <Component error={error} />
}

function normalizeStatus(code: unknown): ErrorStatusCode | undefined {
  if (typeof code === 'number') {
    return normalizeStatus(code.toString())
  }

  if (typeof code === 'string') {
    const trimmed = code.trim()
    if (trimmed === '403' || trimmed === '404' || trimmed === '500') {
      return trimmed as ErrorStatusCode
    }
  }

  return undefined
}

function getStatusFromError(error: unknown): ErrorStatusCode | undefined {
  if (!error) return undefined

  if (isRouteErrorResponse(error)) {
    return normalizeStatus(error.status)
  }

  if (error instanceof AppError) {
    return normalizeStatus(error.code)
  }

  if (error instanceof Error) {
    const candidate =
      (error as unknown as { status?: unknown }).status ??
      (error as unknown as { statusCode?: unknown }).statusCode ??
      (error as unknown as { code?: unknown }).code
    return normalizeStatus(candidate)
  }

  if (typeof error === 'object') {
    const candidate =
      (error as { status?: unknown }).status ??
      (error as { statusCode?: unknown }).statusCode ??
      (error as { code?: unknown }).code
    return normalizeStatus(candidate)
  }

  return undefined
}

export default RouteErrorElement
