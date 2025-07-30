import React from "react"
import { Drawer, DrawerProps } from "antd"

const CustomDrawer: React.FC<DrawerProps> = ({
  placement = "right",
  closable = false,
  ...props
}) => {
  return (
    <Drawer closable={closable} placement={placement} {...props}>
      {props.children}
    </Drawer>
  )
}

export default CustomDrawer
