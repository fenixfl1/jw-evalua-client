import React from "react"
import { ColorPicker, ColorPickerProps } from "antd"

const CustomColorPicker: React.FC<ColorPickerProps> = ({ ...props }) => {
  return <ColorPicker {...props} />
}

export default CustomColorPicker
