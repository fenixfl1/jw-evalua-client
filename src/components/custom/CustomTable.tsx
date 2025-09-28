/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { TableProps } from 'antd/lib/table'
import styled from 'styled-components'
import { DownloadOutlined } from '@ant-design/icons'
import ConditionalComponent from '../ConditionalComponent'
import CustomButton from './CustomButton'
import CustomTooltip from './CustomTooltip'
import ExportOptions from '../ExportOptions'

const Container = styled.div`
  position: relative;

  .btn-export-table {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
  }
`

type SimpleCol = string
type ChildDef = { key: string; header: string }
export type GroupCol = {
  header: string
  children: ChildDef[]
  maxItems?: number
}

export type ColumnsMap = Record<string, SimpleCol | GroupCol>

interface CustomTableProps extends Omit<TableProps<any>, 'onChange'> {
  onChange?: (page: number, size: number) => void
  exportable?: boolean
  columnsMap?: ColumnsMap
}

export interface CustomColumnType<T> extends ColumnType<T> {
  editable?: boolean
}

const CustomTable = React.forwardRef<any, CustomTableProps>(
  (
    {
      dataSource = [],
      expandable,
      bordered = false,
      onChange,
      exportable = false,
      columnsMap,
      ...props
    },
    ref
  ) => {
    const [modalState, setModalState] = useState(false)

    return (
      <>
        <Container>
          <ConditionalComponent condition={exportable}>
            <CustomTooltip title={'Exportar'}>
              <CustomButton
                className={'btn-export-table'}
                size={'large'}
                icon={<DownloadOutlined />}
                type={'text'}
                onClick={() => setModalState(true)}
              >
                Exportar
              </CustomButton>
            </CustomTooltip>
          </ConditionalComponent>
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

        <ConditionalComponent condition={modalState}>
          <ExportOptions
            columnsMap={columnsMap}
            dataSource={dataSource}
            onCancel={() => setModalState(false)}
            open={modalState}
            ref={ref}
          />
        </ConditionalComponent>
      </>
    )
  }
)

export default CustomTable
