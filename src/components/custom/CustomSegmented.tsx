import { Segmented as AntSegmented, SegmentedProps } from "antd"
import { SegmentedValue } from "antd/es/segmented"
import React, { useEffect, useState } from "react"
import styled from "styled-components"

interface CustomSegmentedProps extends Omit<SegmentedProps, "onChange"> {
  onChange?: (value: any) => void
}

const Segmented = styled(AntSegmented)<SegmentedProps>`
  background-color: #e3e6e9 !important;
`

const CustomSegmented = React.forwardRef<HTMLDivElement, CustomSegmentedProps>(
  ({ value = "", onChange, ...props }, ref) => {
    const [currentValue, setCurrentValue] = useState<SegmentedValue>()

    useEffect(() => {
      setCurrentValue(value)
    }, [value])

    return (
      <Segmented
        ref={ref}
        value={currentValue}
        onClick={({ target }: any) => {
          setCurrentValue(target.innerHTML)
          onChange?.(target.innerHTML)
        }}
        {...props}
      />
    )
  }
)

export default CustomSegmented
