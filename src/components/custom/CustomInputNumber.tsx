import React, { useState } from "react"
import { InputNumberProps } from "antd/lib/input-number"
import { InputNumber } from "antd"
import { defaultTheme } from "@/styles/themes"

type FormatType = "currency" | "percent" | "range"
export type CurrencyType = "RD" | "UE" | "US"

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
  format = { format: "", currency: "" },
  precision = 2,
  style,
  width,
  size = defaultTheme.size,
  max,
  ...props
}) => {
  const [maxValue, setMaxValue] = useState<number>()

  const formatter = (value: number | string) => {
    switch (format.format) {
      case "currency": {
        return {
          format: `${format.currency}$ ${value}`.replace(regExp, ","),
          parse: `${value}`
            .replace(format.currency?.[0] as string, "")
            .replace(format.currency?.[1] as string, "")
            .replace(/\$\s?|(,*)/g, ""),
        }
      }
      case "percent": {
        !max ? setMaxValue(100) : setMaxValue(Number(max))
        return {
          format: `${value}%`,
          parse: `${value}`.replace("%", ""),
        }
      }
      case "range": {
        return {
          format: `${Math.trunc(Number(value))}`,
          parse: `${value}`.replace("%", ""),
        }
      }
      default:
        return {
          format: undefined as unknown as string,
          parse: undefined as unknown as string,
        }
    }
  }

  return (
    <InputNumber
      formatter={(value) => formatter(value as string).format}
      parser={(value) => formatter(value as string).parse}
      precision={precision}
      max={max ?? maxValue}
      size={size}
      style={{ ...style, width }}
      {...props}
    />
  )
}

export default CustomInputNumber
