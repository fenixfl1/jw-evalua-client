import React from "react"
import { Space } from "antd"
import { SpaceCompactProps } from "antd/lib/space/Compact"

const { Compact } = Space

const CustomSpaceCompact: React.FC<SpaceCompactProps> = ({
  size = "middle",
  ...props
}) => {
  return (
    <Compact size={size} {...props}>
      {props.children}
    </Compact>
  )
}

export default CustomSpaceCompact
