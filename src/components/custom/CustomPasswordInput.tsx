import { Input, InputRef } from 'antd'
import { PasswordProps } from 'antd/es/input'
import { forwardRef } from 'react'

const { Password } = Input

const CustomPasswordInput = forwardRef<InputRef, PasswordProps>(
  ({ size, ...props }, ref) => {
    return <Password size={size} {...props} ref={ref} />
  }
)

export default CustomPasswordInput
