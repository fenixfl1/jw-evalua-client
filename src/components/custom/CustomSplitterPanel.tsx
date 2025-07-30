import React from "react"
import { Splitter } from "antd"
import { PanelProps } from "antd/lib/splitter/interface"

interface CustomSplitterPanelProps extends PanelProps {
  children?: React.ReactNode | React.ReactNode[]
}

const CustomSplitterPanel: React.FC<CustomSplitterPanelProps> = ({
  ...props
}) => {
  return <Splitter.Panel {...props}>{props.children}</Splitter.Panel>
}

export default CustomSplitterPanel
