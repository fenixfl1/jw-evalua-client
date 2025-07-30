import React from "react"
import { Space, SpaceProps } from "antd"

interface CustomSpaceProps extends SpaceProps {
  width?: string | number
}

const CustomSpace: React.FC<CustomSpaceProps> = ({
  size = "middle",
  direction = "vertical",
  width = "100%",
  style,
  ...props
}) => {
  return (
    <Space
      size={size}
      direction={direction}
      style={{ ...style, width }}
      {...props}
    >
      {props.children}
    </Space>
  )
}

export default CustomSpace
