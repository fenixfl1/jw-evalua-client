import React from "react"
import { Avatar } from "antd"
import { GroupProps } from "antd/lib/avatar"
import { defaultTheme } from "@/styles/themes"

const { Group } = Avatar

const CustomAvatarGroup: React.FC<GroupProps> = ({
  size = "small",
  max = { count: 5, popover: { trigger: "hover" } },
  ...props
}) => {
  return (
    <Group max={max} size={size} {...props}>
      {props.children}
    </Group>
  )
}

export default CustomAvatarGroup
