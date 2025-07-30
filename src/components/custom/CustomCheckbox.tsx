import React from "react"
import { Checkbox, CheckboxProps } from "antd"

const CustomCheckbox: React.FC<CheckboxProps> = ({ checked, ...props }) => {
  return (
    <Checkbox checked={checked} {...props}>
      {props.children}
    </Checkbox>
  )
}

export default CustomCheckbox
