/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, NotificationArgsProps } from 'antd'
import { useCallback } from 'react'
import { ErroMessageMode } from '../types/general'
import { ERROR_MESSAGES } from 'src/constants/message'

const useDefaultMessage = ['DB_CONFLICT_ERROR', 'CUSTOM_UNEXPECTED_ERROR']

type ErrorHandler = (
  error: any,
  options?: Partial<NotificationArgsProps> & {
    useServerMessage?: boolean
    mode?: ErroMessageMode
    onOk?: () => void
  }
) => void

export function useErrorHandler(): [ErrorHandler] {
  const { notification, modal } = App.useApp()

  const handleError = useCallback(
    (
      error: any,
      options?: Partial<NotificationArgsProps> & {
        useServerMessage?: boolean
        mode?: ErroMessageMode
        onOk?: () => void
      }
    ) => {
      const {
        useServerMessage = false,
        mode: overrideMode,
        onOk,
        ...notificationProps
      } = options || {}

      let ERROR_CODE: string | undefined
      let alert_msg: string = ''
      const fallbackCode = 'UNEXPECTED_ERROR'
      const mode: ErroMessageMode = overrideMode ?? error?.mode

      // Ant Design form errors
      if (error?.errorFields) {
        error.message = error.errorFields
          .map((item) => `<strong style="color: red">»</strong> ${item.errors}`)
          .join('<br/>')
        error.code = 'FE006'
        error.name = 'ValidationError'
        ERROR_CODE = 'FE006'
      }

      // Datos del backend
      const backendData = error.response?.data ?? {}
      const serverErrorCode = backendData.errorCode
      const serverMessage = backendData.message
      const serverErrorName = backendData.error

      // Config predefinida
      const errorKey = serverErrorName ?? error.name
      const config = ERROR_MESSAGES[errorKey] ?? {}
      const {
        message: fallbackMessage,
        title = 'Error',
        type = 'warning',
        error_code = fallbackCode,
        code,
      } = config

      const shouldUseServerMessage =
        (useServerMessage && error_code !== 'UNEXPECTED_ERROR') ||
        useDefaultMessage.includes(error_code) ||
        import.meta.env.MODE === 'development'

      const finalMessage =
        shouldUseServerMessage && serverMessage
          ? serverMessage
          : error.message ||
            fallbackMessage ||
            'Ha ocurrido un error inesperado.'

      if (error.name !== 'AxiosError') {
        ERROR_CODE = error.code ?? fallbackCode
        alert_msg =
          ERROR_CODE === 'FE006'
            ? finalMessage
            : fallbackMessage || finalMessage
      } else {
        ERROR_CODE = serverErrorCode
          ? `${error_code}_${serverErrorCode}`
          : error_code
        alert_msg = finalMessage
      }

      console.error({ [`${code}_${ERROR_CODE}`]: alert_msg, error })

      const description = `
      ${alert_msg}
      <br /><br />
      <strong>Código: <code>${code ?? error_code}</code></strong>
    `

      if (mode === 'modal') {
        modal.warning({
          title,
          content: <div dangerouslySetInnerHTML={{ __html: description }} />,
          onOk,
        })
      } else {
        notification[type]({
          message: title,
          description: (
            <div dangerouslySetInnerHTML={{ __html: description }} />
          ),
          ...notificationProps,
        })
      }
    },
    [notification, modal]
  )

  return [handleError]
}
