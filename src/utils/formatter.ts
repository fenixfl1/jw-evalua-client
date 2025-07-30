import moment from 'moment'
import { DATE_FORMAT, LOG_DATE_FORMAT } from './data-utils'

export interface Formatter {
  value: string | number | undefined
  format:
    | 'phone'
    | 'document'
    | 'currency'
    | 'date'
    | 'long_date'
    | 'percentage'
  prefix?: string
  fix?: number
}

/**
 * This function is used to format a specific string to a specific formatW
 * @param {string} value - The string to be formatted
 * @param {string} format - The format to be applied
 */
function formatter(props: Formatter) {
  const { format, prefix = '', fix = 0 } = props
  const value = String(props.value)
  const originalValue = prefix ? `${prefix} ${value}` : `${value}`
  if (format) {
    if (format === 'phone') {
      return originalValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
    if (format === 'document') {
      if (value.length === 11) {
        return originalValue.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3')
      } else {
        return originalValue.replace(/(\d)(\d{2})(\d{5})(\d)/, '$1-$2-$3-$4')
      }
    }
    if (format === 'currency') {
      const fixedValue = parseFloat(value).toFixed(fix)
      if (prefix) {
        return `${prefix}$ ${fixedValue.replace(
          /\B(?=(\d{3})+(?!\d)\.?)/g,
          ','
        )}`
      }
      return fixedValue.replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ',')
    }
    if (format === 'long_date') {
      return moment(originalValue)
        .format(LOG_DATE_FORMAT)
        ?.replace('Fecha inválida', 'N/A')
    }
    if (format === 'date') {
      const date = moment(originalValue)
      return date.isValid() ? date.format(DATE_FORMAT) : ''
    }
    if (format === 'percentage') {
      const fixedValue = parseFloat(value).toFixed(fix)
      return `%${fixedValue.replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ',')}`
    }
  }

  return originalValue
}

export default formatter
