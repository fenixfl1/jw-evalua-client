import React from "react"
import { Input } from "antd"
import { GroupProps } from "antd/es/input"

const { Group } = Input

const CustomInputGroup: React.FC<GroupProps> = ({
  compact = true,
  ...props
}) => {
  return (
    <Group compact={compact} {...props}>
      {props.children}
    </Group>
  )
}

export default CustomInputGroup
