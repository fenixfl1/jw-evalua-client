import { Row, RowProps } from 'antd'
import React from 'react'

interface CustomRowProps extends RowProps {
  width?: string | number
  height?: string | number
  gap?: string | number
}

const CustomRow = React.forwardRef<HTMLDivElement, CustomRowProps>(
  (
    {
      gap,
      justify = 'center',
      align = 'middle',
      width,
      height,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Row
        align={align}
        justify={justify}
        ref={ref}
        style={{ ...style, width, height, gap }}
        {...props}
      >
        {props.children}
      </Row>
    )
  }
)

export default CustomRow
