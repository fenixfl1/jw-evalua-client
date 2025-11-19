import React from 'react'
import { Input } from 'antd'
import { TextAreaProps } from 'antd/es/input'
import { TextAreaRef } from 'antd/es/input/TextArea'
import { useFormContext } from 'src/context/FormContext'
import { useFormItemContext } from 'src/context/FormItemContext'

const { TextArea } = Input

const CustomTextArea = React.forwardRef<TextAreaRef, TextAreaProps>(
  ({ maxLength = 200, readOnly, showCount = true, ...props }, ref) => {
    const context = useFormContext()
    const itemContext = useFormItemContext()

    return (
      <TextArea
        readOnly={readOnly ?? itemContext?.readonly ?? context?.readonly}
        maxLength={maxLength}
        showCount={showCount}
        ref={ref}
        {...props}
      />
    )
  }
)

export default CustomTextArea
