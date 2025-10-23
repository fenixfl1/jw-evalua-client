import React, { useState } from 'react'
import CustomSelect from './custom/CustomSelect'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import CustomSpaceCompact from './custom/CustomSpaceCompact'
import CustomDatePicker from './custom/CustomDatePicker'
import dayjs, { Dayjs } from 'dayjs'

interface PeriodSelectorProps {
  /** valor seleccionado (periodId) -> controlado por Form */
  value?: number
  /** disparado por cambios de periodo -> lo usa Form */
  onChange?: (value: number) => void
  /** callback opcional si te interesa saber cuando cambia el año */
  onYearChange?: (year: number) => void
  /** compat: si ya usabas onSelect */
  onSelect?: (value: number) => void
  onClear?: () => void
  width?: string | number
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  onYearChange,
  onSelect,
  onClear,
  width = '100%',
}) => {
  const [yearValue, setYearValue] = useState<number | undefined>(
    Number(`${value}`.slice(0, 4))
  )
  const [periods] = useGetPeriods(yearValue)

  const handleYearChange = (date: Dayjs | null) => {
    const y = date ? Number(date.format('YYYY')) : undefined
    setYearValue(y)
    onYearChange?.(y as number)
    onChange?.(
      value.toString().length === 6
        ? Number(`${y}${String(value).slice(4)}`)
        : undefined
    )
  }

  const handlePeriodChange = (v: number) => {
    const str = String(v).slice(4)
    const value = Number(`${yearValue}${str}`)

    onChange?.(value)
    onSelect?.(value)
  }

  const handleClear = () => {
    setYearValue(undefined)
    onClear?.()
  }

  return (
    <CustomSpaceCompact style={{ width }}>
      <CustomDatePicker
        suffixIcon={null}
        value={yearValue ? dayjs(String(yearValue), 'YYYY') : undefined}
        width={'50%'}
        format={'YYYY'}
        picker={'year'}
        onChange={handleYearChange}
      />

      <CustomSelect
        disabled={!yearValue}
        allowClear
        onClear={handleClear}
        width={'50%'}
        value={value ? value : undefined}
        placeholder={'Seleccionar periodo'}
        onChange={handlePeriodChange}
        options={periods.map((item) => ({
          ...item,
          label: item.label.split('-')[1],
        }))}
      />
    </CustomSpaceCompact>
  )
}

export default PeriodSelector
