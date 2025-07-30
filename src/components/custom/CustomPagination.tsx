import React from "react"
import { Pagination, PaginationProps } from "antd"

const CustomPagination: React.FC<PaginationProps> = ({
  align = "end",
  showSizeChanger = true,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 5,
  ...props
}) => {
  return (
    <Pagination
      align={align}
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      showSizeChanger={showSizeChanger}
      {...props}
    />
  )
}

export default CustomPagination
