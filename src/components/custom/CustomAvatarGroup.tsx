import React from 'react'
import { Avatar } from 'antd'
import { AvatarGroupProps } from 'antd/lib/avatar/AvatarGroup'

const { Group } = Avatar

const CustomAvatarGroup: React.FC<AvatarGroupProps> = ({
  size = 'small',
  max = { count: 5, popover: { trigger: 'hover' } },
  ...props
}) => {
  return (
    <Group max={max} size={size} {...props}>
      {props.children}
    </Group>
  )
}

export default CustomAvatarGroup
