import React from "react"
import { DatePicker } from "antd"
import { RangePickerProps } from "antd/es/date-picker"

import "dayjs/locale/es"
import { defaultTheme } from "@/styles/themes"
import { DATE_FORMAT } from "@/helpers/date-helpers"

const { RangePicker } = DatePicker

const CustomRangePicker = React.forwardRef<any, RangePickerProps>(
  (
    { size = defaultTheme.size, format = DATE_FORMAT, width, style, ...props },
    ref
  ) => {
    return (
      <RangePicker
        size={size}
        format={format}
        ref={ref}
        style={{ ...style, width }}
        {...props}
      />
    )
  }
)

export default CustomRangePicker
