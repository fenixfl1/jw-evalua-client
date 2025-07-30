import React from "react"
import { Table, GetProps } from "antd"

const { Row } = Table.Summary

type CustomTableSummaryRowProps = GetProps<typeof Row>

const CustomTableSummaryRow: React.FC<CustomTableSummaryRowProps> = ({
  ...props
}) => {
  return <Row {...props}>{props.children}</Row>
}

export default CustomTableSummaryRow
