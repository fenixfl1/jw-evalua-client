import { Layout } from "antd"
import { BasicProps } from "antd/lib/layout/layout"
import React from "react"

const { Content } = Layout

const CustomContent = React.forwardRef<HTMLDivElement, BasicProps>(
  (props, ref) => {
    return (
      <Content {...props} ref={ref}>
        {props.children}
      </Content>
    )
  }
)

export default CustomContent
