import React from "react"
import { Dropdown, DropdownProps } from "antd"

const CustomDropdown: React.FC<DropdownProps> = ({
  trigger = ["click"],
  ...props
}) => {
  return (
    <Dropdown trigger={trigger} {...props}>
      {props.children}
    </Dropdown>
  )
}

export default CustomDropdown
