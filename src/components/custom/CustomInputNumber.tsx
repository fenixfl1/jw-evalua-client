import React from 'react'
import { InputNumberProps } from 'antd/lib/input-number'
import { InputNumber } from 'antd'

type FormatType = 'currency' | 'percent' | 'range'
export type CurrencyType = 'RD' | 'UE' | 'US'

export type InputFormat = {
  format: FormatType
  currency?: CurrencyType
}

export interface CustomInputNumberProps extends InputNumberProps {
  format?: InputFormat
  width?: number | string
}

const regExp = /\B(?=(\d{3})+(?!\d)\.?)/g

const CustomInputNumber: React.FC<CustomInputNumberProps> = ({
  format = { format: '', currency: '' },
  precision,
  style,
  width,
  max,
  onChange,
  ...props
}) => {
  const isPercent = format.format === 'percent'
  const isCurrency = format.format === 'currency'
  const isRange = format.format === 'range'

  const formatterFn = isCurrency
    ? (value?: string | number) =>
        `${format.currency}$ ${value ?? ''}`.replace(regExp, ',')
    : isPercent
    ? (value?: string | number) => `${value ?? ''}%`
    : isRange
    ? (value?: string | number) => `${Math.trunc(Number(value ?? ''))}`
    : undefined

  const parserFn = isCurrency
    ? (value?: string) =>
        `${value ?? ''}`
          .replace(format.currency?.[0] as string, '')
          .replace(format.currency?.[1] as string, '')
          .replace(/\$\s?|(,*)/g, '')
    : isPercent
    ? (value?: string) => `${value ?? ''}`.replace('%', '')
    : isRange
    ? (value?: string) => `${value ?? ''}`.replace('%', '')
    : undefined

  const handleChange: InputNumberProps['onChange'] = (val) => {
    const next = typeof val === 'number' && Number.isNaN(val) ? null : val
    onChange?.(next)
  }

  return (
    <InputNumber
      formatter={formatterFn}
      parser={parserFn}
      precision={precision}
      max={isPercent ? max ?? 100 : max}
      style={{ ...style, width }}
      onChange={handleChange}
      {...props}
    />
  )
}

export default CustomInputNumber
