import React from 'react'
import { Tabs, TabsProps } from 'antd'

const CustomTabs: React.FC<TabsProps> = ({ type = 'line', ...props }) => {
  return <Tabs type={type} {...props} />
}

export default CustomTabs
