import { Result, ResultProps } from "antd"
import React from "react"

const CustomResult: React.FC<ResultProps> = ({ ...props }) => {
  return <Result {...props} />
}

export default CustomResult
