import React from "react"
import { Layout } from "antd"
import { BasicProps } from "antd/lib/layout/layout"

const { Footer } = Layout

const CustomFooter = React.forwardRef<HTMLDivElement, BasicProps>(
  (props, ref) => {
    return (
      <Footer ref={ref} {...props}>
        {props.children}
      </Footer>
    )
  }
)

export default CustomFooter
