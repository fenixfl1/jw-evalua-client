import React from 'react'
import { Badge, BadgeProps } from 'antd'

const CustomBadge: React.FC<BadgeProps> = ({
  showZero = false,
  overflowCount = 9,
  ...props
}) => {
  return (
    <Badge overflowCount={overflowCount} showZero={showZero} {...props}>
      {props.children}
    </Badge>
  )
}

export default CustomBadge
