/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { DatePicker } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'

import 'dayjs/locale/es'
import { DATE_FORMAT } from 'src/utils/date-utils'

const { RangePicker } = DatePicker

const CustomRangePicker = React.forwardRef<any, RangePickerProps>(
  ({ size, format = DATE_FORMAT, width, style, ...props }, ref) => {
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
