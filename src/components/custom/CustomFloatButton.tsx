import React from "react"
import { FloatButton, FloatButtonProps } from "antd"

const CustomFloatButton: React.FC<FloatButtonProps> = ({ ...props }) => (
  <FloatButton {...props} />
)

export default CustomFloatButton
