import { AdvancedCondition } from 'src/types/general'

export const operatorAlias = {
  EQ: '=',
  BETWEEN: 'BETWEEN',
  NULL: 'IS NULL',
  LIKE: 'LIKE',
  IN: 'IN',
  NOT_IN: 'NOT INT',
}

export function getConditionFromForm<
  T = Record<string, string | number | boolean | (string | number)[]>
>(record = {} as T): AdvancedCondition<T>[] {
  const condition: AdvancedCondition[] = []

  Object.entries(record).forEach(([key, value]) => {
    const [field, flag] = key.split('__')
    const operator = operatorAlias[flag]

    if (value) {
      condition.push({
        field,
        operator,
        value,
      })
    }
  })

  return condition
}
