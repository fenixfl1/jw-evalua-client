import { Flex, FlexProps } from "antd"
import React from "react"

const CustomFlex: React.FC<FlexProps> = ({ wrap = true, ...props }) => {
  return (
    <Flex wrap={wrap} {...props}>
      {props.children}
    </Flex>
  )
}

export default CustomFlex
