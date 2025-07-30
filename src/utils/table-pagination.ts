import { TablePaginationConfig } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { Metadata } from 'src/types/general'

export const getTablePagination = (
  metadata: Metadata
): PaginationConfig & TablePaginationConfig => {
  return {
    current: metadata.currentPage,
    pageSize: metadata.pageSize,
    pageSizeOptions: [10, 15, 20, 25, 50, 75, 100],
    total: metadata.totalPages,
  }
}
