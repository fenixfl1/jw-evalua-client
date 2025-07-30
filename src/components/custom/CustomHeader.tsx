import { Layout } from "antd"
import { BasicProps } from "antd/lib/layout/layout"
import React from "react"

const { Header } = Layout

const CustomHeader = React.forwardRef<HTMLDivElement, BasicProps>(
  (props, ref) => {
    return (
      <Header {...props} ref={ref}>
        {props.children}
      </Header>
    )
  }
)

export default CustomHeader
