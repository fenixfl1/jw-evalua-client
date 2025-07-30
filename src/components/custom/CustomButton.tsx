import React from 'react'
import { Button, ButtonProps } from 'antd'

const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size, ...props }, ref) => {
    return (
      <Button size={size} {...props} ref={ref}>
        {props.children}
      </Button>
    )
  }
)

export default CustomButton
