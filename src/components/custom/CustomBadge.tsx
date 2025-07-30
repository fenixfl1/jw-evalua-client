import React from "react"
import { Badge, BadgeProps } from "antd"
import { defaultTheme } from "@/styles/themes"

const CustomBadge: React.FC<BadgeProps> = ({
  size = defaultTheme.size,
  showZero = false,
  overflowCount = 9,
  ...props
}) => {
  return (
    <Badge
      overflowCount={overflowCount}
      size={size as never}
      showZero={showZero}
      {...props}
    >
      {props.children}
    </Badge>
  )
}

export default CustomBadge
