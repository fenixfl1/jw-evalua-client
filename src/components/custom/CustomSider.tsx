import React from "react"
import { Layout, SiderProps } from "antd"

const { Sider } = Layout

const CustomSider = React.forwardRef<HTMLDivElement, SiderProps>(
  (props, ref) => {
    return (
      <Sider ref={ref} {...props}>
        {props.children}
      </Sider>
    )
  }
)

export default CustomSider
