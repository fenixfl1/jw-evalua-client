/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { TableProps } from 'antd/lib/table'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;

  .btn-export-table {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
  }
`

interface CustomTableProps extends Omit<TableProps<any>, 'onChange'> {
  onChange?: (page: number, size: number) => void
}

export interface CustomColumnType<T> extends ColumnType<T> {
  editable?: boolean
}

const CustomTable = React.forwardRef<any, CustomTableProps>(
  (
    { dataSource = [], expandable, bordered = false, onChange, ...props },
    ref
  ) => {
    return (
      <>
        <Container>
          <Table
            dataSource={dataSource}
            bordered={bordered}
            ref={ref}
            onChange={({ current, pageSize }) => onChange?.(current, pageSize)}
            rowClassName={(record) =>
              record?.state === 'A' ? 'active-row' : 'inactive-row'
            }
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '15', '20', '25'],
              simple: true,
              ...props.pagination,
            }}
            expandable={{
              indentSize: 25,
              ...expandable,
            }}
            {...props}
          />
        </Container>
      </>
    )
  }
)

export default CustomTable
