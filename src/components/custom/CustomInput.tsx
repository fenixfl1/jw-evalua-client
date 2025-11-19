import React from 'react'
import { Input, InputProps, InputRef } from 'antd'
import { useFormItemContext } from 'src/context/FormItemContext'
import { useFormContext } from 'src/context/FormContext'

export interface CustomInputProps extends InputProps {
  autoComplete?: string
  tooltip?: string
  alwaysAvailable?: boolean
  notNumber?: boolean
  width?: string | number
}

const CustomInput = React.forwardRef<InputRef, CustomInputProps>(
  ({ autoComplete = 'off', width, ...props }, ref) => {
    const context = useFormContext()
    const itemContext = useFormItemContext()

    return (
      <Input
        readOnly={itemContext?.readonly ?? context?.readonly}
        autoComplete={autoComplete}
        ref={ref}
        style={{ ...props.style, width }}
        {...props}
      />
    )
  }
)

export default CustomInput
