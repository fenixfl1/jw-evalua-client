import React from 'react'
import type { StatisticTimerProps } from 'antd'
import { Statistic } from 'antd'

const { Timer } = Statistic

interface CustomStatisticTImerProps extends Omit<StatisticTimerProps, 'type'> {
  type?: StatisticTimerProps['type']
}

const CustomTimer: React.FC<CustomStatisticTImerProps> = ({
  type = 'countup',
  ...props
}) => {
  return <Timer type={type} {...props} />
}

export default CustomTimer
