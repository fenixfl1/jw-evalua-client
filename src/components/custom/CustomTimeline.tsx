import React from "react"
import { Timeline } from "antd"
import type { TimelineProps } from "antd"

const CustomTimeline: React.FC<TimelineProps> = ({
  mode = "alternate",
  ...props
}) => {
  return <Timeline mode={mode} {...props} />
}

export default CustomTimeline
