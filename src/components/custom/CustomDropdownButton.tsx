import React from "react"
import { Dropdown } from "antd"
import { DropdownButtonProps } from "antd/lib/dropdown"
import { defaultTheme } from "@/styles/themes"

const { Button } = Dropdown

const CustomDropdownButton: React.FC<DropdownButtonProps> = ({
  size = defaultTheme.size,
  ...props
}) => {
  return (
    <Button size={size} {...props}>
      {props.children}
    </Button>
  )
}

export default CustomDropdownButton
