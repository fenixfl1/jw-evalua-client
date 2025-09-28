export interface Competency {
  COMPETENCY_ID: number
  NAME: string
  DESCRIPTION?: string | null
  WEIGHT?: number | null
  STATE: string
  CREATED_AT?: string | Date | null
  UPDATED_AT?: string | Date | null
  CREATED_BY?: number | null
  UPDATED_BY?: number | null
}
