import React from 'react'
import { Spin, SpinProps } from 'antd'

const CustomSpin: React.FC<SpinProps> = ({ spinning = false, ...props }) => {
  return (
    <Spin spinning={spinning} {...props}>
      {props.children}{' '}
    </Spin>
  )
}

export default CustomSpin
