import React from "react"
import { Tree, TreeProps } from "antd"

const CustomTree: React.FC<TreeProps> = ({
  autoExpandParent = true,
  checkable = true,
  ...props
}) => {
  return (
    <Tree
      autoExpandParent={autoExpandParent}
      checkable={checkable}
      {...props}
    />
  )
}

export default CustomTree
