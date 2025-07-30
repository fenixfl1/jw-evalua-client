import React from "react"
import { Popover, PopoverProps } from "antd"
import { TooltipRef } from "antd/lib/tooltip"
import styled from "styled-components"

export const PopoverContainer = styled.div`
  width: 300px;
  max-height: 300px;
  padding: 10px;
  margin-bottom: 10px;
  overflow-y: auto;
`

const CustomPopover = React.forwardRef<TooltipRef, PopoverProps>(
  ({ placement = "bottom", trigger = "click", ...props }, ref) => {
    return (
      <Popover placement={placement} {...props} ref={ref} trigger={trigger}>
        {props.children}
      </Popover>
    )
  }
)

export default CustomPopover
