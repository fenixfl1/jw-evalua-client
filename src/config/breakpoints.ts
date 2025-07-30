const screenSizes = {
  s: 375,
  m: 768,
  l: 1000,
  xl: 1440,
  xxl: 1920,
}

export const mediaQueries = {
  s: `@media screen and (min-width: ${screenSizes.s + 1}px)`,
  m: `@media screen and (min-width: ${screenSizes.m + 1}px)`,
  l: `@media screen and (min-width: ${screenSizes.l + 1}px)`,
  xl: `@media screen and (min-width: ${screenSizes.xl + 1}px)`,
  xxl: `@media screen and (min-width: ${screenSizes.xxl + 1}px)`,
}

export const maxDesktopWidth = '1180px'

export const defaultBreakpoints = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12,
}

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
    md: { span: 4 },
    lg: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
}

export const labelColFullWidth = {
  labelCol: {
    xs: { span: 2 },
    sm: { span: 8 },
    md: { span: 4 },
  },
}

export const colBreakpoints = {
  xs: 24,
  lg: 20,
  xxl: 18,
}
