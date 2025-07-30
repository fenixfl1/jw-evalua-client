import React from "react"
import { Input } from "antd"
import { TextAreaProps } from "antd/es/input"
import { TextAreaRef } from "antd/es/input/TextArea"

const { TextArea } = Input

const CustomTextArea = React.forwardRef<TextAreaRef, TextAreaProps>(
  ({ maxLength = 200, showCount = true, ...props }, ref) => {
    return (
      <TextArea
        maxLength={maxLength}
        showCount={showCount}
        ref={ref}
        {...props}
      />
    )
  }
)

export default CustomTextArea
