import { AdvancedCondition } from 'src/types/general'

export const operatorAlias = {
  BETWEEN: 'BETWEEN',
  EQ: '=',
  EXCLUDE: '!=',
  GT: '>',
  GTE: '>=',
  IN: 'IN',
  LIKE: 'LIKE',
  LT: '<',
  LTE: '<=',
  NOT_IN: 'NOT INT',
  NULL: 'IS NULL',
}

export function getConditionFromForm<
  T = Record<string, string | number | boolean | (string | number)[]>
>(record = {} as T): AdvancedCondition<T>[] {
  const condition: AdvancedCondition[] = []

  Object.entries(record).forEach(([key, value]) => {
    const [fields, flag] = key.split('__')
    let operator = operatorAlias[flag]

    let field: string | string[] = fields
    if (fields.includes('&')) {
      field = fields.split('&')
    }

    if (typeof value === 'boolean' && flag !== 'NULL') {
      operator = 'IS NULL'
    }

    if (value || value?.length) {
      condition.push({
        field,
        operator,
        value,
      })
    }
  })

  return condition
}
