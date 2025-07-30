import type { AnchorProps } from 'antd'
import { Anchor } from 'antd'
import React from 'react'

const CustomAnchor: React.FC<AnchorProps> = ({ ...props }) => {
  return <Anchor {...props} />
}

export default CustomAnchor
