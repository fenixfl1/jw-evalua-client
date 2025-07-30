import React from "react"
import { Col, ColProps } from "antd"

const CustomCol = React.forwardRef<HTMLDivElement, ColProps>((props, ref) => {
  return (
    <Col {...props} ref={ref}>
      {props.children}
    </Col>
  )
})

export default CustomCol
