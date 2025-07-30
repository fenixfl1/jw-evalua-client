import { ErrorCode, ErrorName } from 'src/types/general'

interface ErrorMessages {
  code: ErrorCode
  error_code: string
  message: string
  title: string
  type: 'success' | 'warning' | 'info' | 'warning'
}

export const ERROR_MESSAGES: Record<ErrorName, ErrorMessages> = {
  UnexpectedError: {
    message:
      'Estamos experimentando un problema temporal. Por favor, vuelve a intentarlo más tarde.',
    error_code: 'UNEXPECTED_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE001',
  },
  DataNotFound: {
    message: 'No se encontraron datos.',
    error_code: 'DATA_NOT_FOUND',
    type: 'warning',
    title: 'Aviso',
    code: 'BE002',
  },
  PayloadValidationError: {
    message: 'Por favor, verifica los datos ingresados e inténtalo nuevamente.',
    error_code: 'PAYLOAD_VALIDATION_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE003',
  },
  DbUpdateError: {
    message:
      'La actualización de la información no se ha completado correctamente. Te recomendamos intentarlo de nuevo más tarde.',
    error_code: 'DB_UPDATE_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE004',
  },
  DbInsertError: {
    message:
      'La inserción de la información no se ha completado correctamente. Te recomendamos intentarlo de nuevo más tarde.',
    error_code: 'DB_INSERT_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE005',
  },
  EntityNotFound: {
    message:
      'La información que estás buscando no está disponible en estos momentos. Te sugerimos intentarlo de nuevo en otro momento.',
    error_code: 'ENTITY_NOT_FOUND',
    type: 'warning',
    title: 'Aviso',
    code: 'BE006',
  },
  E002: {
    message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
    error_code: 'EXPIRED_SESSION_E002',
    type: 'warning',
    title: 'Aviso',
    code: 'BE007',
  },
  CustomUnexpectedError: {
    message: '',
    error_code: 'CUSTOM_UNEXPECTED_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE008',
  },
  InternalError: {
    message:
      'Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.',
    error_code: 'INTERNAL_ERROR',
    type: 'warning',
    title: 'Importante',
    code: 'FE001',
  },
  RangeError: {
    message: 'El valor ingresado es inválido.',
    error_code: 'RANGE_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE002',
  },
  SyntaxError: {
    message: 'Algo no ha ido como se esperaba. Por favor, intenta de nuevo.',
    error_code: 'SYNTAX_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE003',
  },
  ReferenceError: {
    message:
      'No hemos podido procesar la referencia solicitada. Te sugerimos que lo intentes de nuevo más tarde.',
    error_code: 'REFERENCE_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE004',
  },
  TypeError: {
    message:
      'Parece que algo no ha ido como se esperaba. Por favor, vuelve a intentarlo.',
    error_code: 'TYPE_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE005',
  },
  ValidationError: {
    message: 'Por favor, verifica los datos ingresados e inténtalo nuevamente.',
    error_code: 'VALIDATION_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE006',
  },
  DbConflictError: {
    message: '',
    error_code: 'DB_CONFLICT_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'BE009',
  },
  DataCloneError: {
    message:
      'Hubo un problema al guardar la información localmente. Intenta nuevamente o contacta soporte.',
    error_code: 'DATA_CLONE_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE007',
  },
  NotFoundError: {
    message:
      'No se pudo acceder a la información almacenada. Puede que haya sido eliminada o no esté disponible.',
    error_code: 'NOTA_FOUND_ERROR',
    type: 'warning',
    title: 'Aviso',
    code: 'FE008',
  },
  InvalidCredentials: {
    message: 'El usuario o contraseña es incorrecto.',
    error_code: 'InvalidCredentials',
    type: 'warning',
    title: 'Aviso',
    code: 401,
  },
}
