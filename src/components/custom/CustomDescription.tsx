import React from "react"
import { DescriptionsProps } from "antd/lib/descriptions"
import { Descriptions } from "antd"

const CustomDescriptions: React.FC<DescriptionsProps> = ({
  items = [],
  ...props
}) => (
  <Descriptions
    items={items.map((item) => ({ ...item, children: item.children || "N/A" }))}
    {...props}
  />
)

export default CustomDescriptions
