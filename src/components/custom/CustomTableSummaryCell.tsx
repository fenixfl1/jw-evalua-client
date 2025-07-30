import React from "react"
import { Table, GetProps } from "antd"

const { Cell } = Table.Summary

type CustomTableSummaryCellProps = GetProps<typeof Cell>

const CustomTableSummaryCell: React.FC<CustomTableSummaryCellProps> = ({
  ...props
}) => {
  return <Cell {...props}>{props.children}</Cell>
}

export default CustomTableSummaryCell
