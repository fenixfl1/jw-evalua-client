import { Splitter, SplitterProps } from "antd"
import React from "react"

interface CustomSplitterProps extends SplitterProps {
  children?: React.ReactNode | React.ReactNode[]
}

const CustomSplitter: React.FC<CustomSplitterProps> = ({ ...props }) => {
  return <Splitter {...props} />
}

export default CustomSplitter
