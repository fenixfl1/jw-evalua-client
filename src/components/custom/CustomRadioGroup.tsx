import React from 'react'
import { Radio, RadioGroupProps } from 'antd'

const { Group } = Radio

const CustomRadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ ...props }, ref) => {
    return <Group {...props} ref={ref} />
  }
)

export default CustomRadioGroup
