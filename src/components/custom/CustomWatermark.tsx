import React from "react"
import { Watermark, WatermarkProps } from "antd"

const CustomWatermark: React.FC<WatermarkProps> = ({ ...props }) => {
  return <Watermark {...props}>{props.children}</Watermark>
}

export default CustomWatermark
