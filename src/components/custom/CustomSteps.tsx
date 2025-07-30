import React from "react"
import { Steps, StepsProps } from "antd"

const CustomSteps: React.FC<StepsProps> = ({
  direction = "horizontal",
  size = "default",
  ...props
}) => {
  return <Steps direction={direction} size={size} {...props} />
}

export default CustomSteps
