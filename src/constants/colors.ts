export const PRIMARY_COLOR = '#3869a1'
export const PRIMARY_COLOR_TEXT = '#434343'
export const SECONDARY_COLOR = '#8cbecb'
export const DEFAULT_COLOR = '#ffffff'
export const SECONDARY_HOVER_COLOR = 'rgba(0, 0, 0, 0.06)'
export const DEFAULT_TEXT_COLOR = 'f0f0f0'
export const DEFAULT_BACKGROUND_COLOR = 'f6f6f6'
export const DEFAULT_BORDER_COLOR = ''
export const DEFAULT_HOVER_COLOR = ''
export const DEFAULT_ACTIVE_COLOR = ''
export const DEFAULT_FOCUS_COLOR = ''
export const WARNING_COLOR = '#f0c954'
export const DANGER_COLOR = '#ff4d4f'
export const SUCCESS_COLOR = '#f0f4f6'
export const INFO_COLOR = ''
export const SECONDARY_BG_COLOR = '#f5f5f5'

export const colors = {
  primary: PRIMARY_COLOR,
  primaryColorText: PRIMARY_COLOR_TEXT,
  secondary: SECONDARY_COLOR,
  default: DEFAULT_COLOR,
  secondaryHover: SECONDARY_HOVER_COLOR,
  text: DEFAULT_TEXT_COLOR,
  baseBackground: DEFAULT_BACKGROUND_COLOR,
  border: DEFAULT_BORDER_COLOR,
  hover: DEFAULT_HOVER_COLOR,
  active: DEFAULT_ACTIVE_COLOR,
  focus: DEFAULT_FOCUS_COLOR,
  warning: WARNING_COLOR,
  danger: DANGER_COLOR,
  success: SUCCESS_COLOR,
  info: INFO_COLOR,
  secondaryBgColor: SECONDARY_BG_COLOR,
}

export const statesColors: Record<string, string> = {
  A: colors.success,
  I: colors.danger,
  P: colors.warning,
  D: colors.danger,
}
