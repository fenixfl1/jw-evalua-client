import { colors } from 'src/constants/colors'
import { Tag, TagProps } from 'antd'
import React from 'react'

const CustomTag: React.FC<TagProps> = ({
  color = colors.primary,
  ...props
}) => {
  return (
    <Tag color={color} {...props}>
      {props.children}
    </Tag>
  )
}

export default CustomTag
