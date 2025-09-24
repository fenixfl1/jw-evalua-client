import dayjs from 'dayjs'
import { useMemo } from 'react'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

interface Period {
  label: string
  value: number
}

export function useGetPeriods(
  year: number = dayjs().year()
): [Period[], number] {
  const period = useMemo(() => {
    const current = Number(
      `${dayjs().year()}${String(dayjs().week()).padStart(2, '0')}`
    )
    const options = Array.from({ length: 53 }, (_, i) => {
      const w = i + 1
      const value = Number(`${year}${String(w).padStart(2, '0')}`)
      return { value, label: `${year}-S${String(w).padStart(2, '0')}` }
    })

    return { options, current }
  }, [year])

  return [period.options, period.current]
}
