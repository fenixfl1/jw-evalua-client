import React from "react"
import { Statistic } from "antd"
import type { StatisticProps } from "antd"

const CustomStatistic: React.FC<StatisticProps> = ({ ...props }) => {
  return <Statistic {...props} />
}

export default CustomStatistic
