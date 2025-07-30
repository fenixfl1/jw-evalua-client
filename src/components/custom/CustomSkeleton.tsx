import { Skeleton, SkeletonProps } from "antd"
import React from "react"

const CustomSkeleton: React.FC<SkeletonProps> = ({ ...props }) => {
  return <Skeleton {...props}>{props.children}</Skeleton>
}

export default CustomSkeleton
