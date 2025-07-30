/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { ErroMessageMode } from '../types/general'
import { ERROR_MESSAGES } from 'src/constants/message'
import { customNotification } from 'src/components/custom/customNotification'
import { CustomModalWarning } from 'src/components/custom/CustomModalMethods'
import { NotificationArgsProps } from 'antd'

const useDefaultMessage = ['DB_CONFLICT_ERROR', 'CUSTOM_UNEXPECTED_ERROR']

/**
 * Maneja errores de solicitud mostrando mensajes adecuados según el modo y tipo de error.
 * @param error - Error lanzado, ya sea del servidor, cliente, o de validación (como Ant Design Forms).
 * @param options - Configuración del mensaje.
 */
export function errorHandler(
  error: any,
  options?: Partial<NotificationArgsProps> & {
    useServerMessage?: boolean
    mode?: ErroMessageMode
    onOk?: () => void
  }
): void {
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

  // Extrae los datos relevantes del error del backend
  const backendData = error.response?.data ?? {}
  const serverErrorCode = backendData.errorCode
  const serverMessage = backendData.message
  const serverErrorName = backendData.error

  // Busca configuración predefinida del error
  const errorKey = serverErrorName ?? error.name
  const config = ERROR_MESSAGES[errorKey] ?? {}
  const {
    message: fallbackMessage,
    title = 'Error',
    type = 'warning',
    error_code = fallbackCode,
    code,
  } = config

  // Decide qué mensaje mostrar
  const shouldUseServerMessage =
    (useServerMessage && error_code !== 'UNEXPECTED_ERROR') ||
    useDefaultMessage.includes(error_code) ||
    import.meta.env.MODE === 'development'

  const finalMessage =
    shouldUseServerMessage && serverMessage
      ? serverMessage
      : error.message || fallbackMessage || 'Ha ocurrido un error inesperado.'

  if (error.name !== 'AxiosError') {
    ERROR_CODE = error.code ?? fallbackCode
    alert_msg =
      ERROR_CODE === 'FE006' ? finalMessage : fallbackMessage || finalMessage
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
    CustomModalWarning({
      title,
      content: description,
      onOk,
    })
  } else {
    customNotification({
      description,
      message: title,
      type,
      ...notificationProps,
    })
  }
}
