import { TablePaginationConfig } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { PaginationType } from 'antd/lib/transfer/interface'
import { Metadata } from 'src/types/general'

export const getTablePagination = (
  metadata: Metadata
): PaginationConfig & TablePaginationConfig & PaginationType => {
  if (!metadata) return false

  return {
    showSizeChanger: true,
    current: metadata.currentPage,
    pageSize: metadata.pageSize,
    pageSizeOptions: [5, 10, 15, 20, 25, 50, 75, 100],
    total: Number(metadata.totalRows ?? 0),
  }
}
