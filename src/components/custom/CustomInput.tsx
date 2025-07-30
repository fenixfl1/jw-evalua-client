import React from 'react'
import { Input, InputProps, InputRef } from 'antd'

export interface CustomInputProps extends InputProps {
  autoComplete?: string
  tooltip?: string
  alwaysAvailable?: boolean
  notNumber?: boolean
  width?: string | number
}

const CustomInput = React.forwardRef<InputRef, CustomInputProps>(
  ({ autoComplete = 'off', width, ...props }, ref) => {
    return (
      <Input
        autoComplete={autoComplete}
        ref={ref}
        style={{ ...props.style, width }}
        {...props}
      />
    )
  }
)

export default CustomInput
