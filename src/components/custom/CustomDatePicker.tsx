import React from 'react'
import { DatePicker } from 'antd'
import { PickerProps } from 'antd/es/date-picker/generatePicker'
import { Dayjs } from 'dayjs'

export type CustomDatePickerProps = PickerProps<Dayjs> & {
  width?: number | string
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  style,
  width = '100%',
  format = 'DD/MM/YYYY',
  ...props
}) => {
  return <DatePicker format={format} style={{ ...style, width }} {...props} />
}

export default CustomDatePicker
