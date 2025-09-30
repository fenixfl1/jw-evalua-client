export interface Staff {
  STAFF_ID: number
  NAME: string
  LAST_NAME: string
  EMAIL: string
  BIRTH_DATE: Date
  PHONE: string
  GENDER: string
  IDENTITY_DOCUMENT: string
  ADDRESS: string
  CREATED_AT?: Date
  CREATED_BY?: number
  STATE?: string
  USER_ID?: number
}

export interface IdentityDocumentValidationResult {
  identityDocument: string
  isValidFormat: boolean
  isInUse: boolean
}
