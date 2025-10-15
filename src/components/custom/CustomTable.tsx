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
import ExportOptions, { ExportFormValue } from '../ExportOptions'

const Container = styled.div`
  position: relative;

  .btn-export-table {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
  }
`

export interface ColumnRenderContext {
  dataIndex: string
  groupKey?: string
  index?: number
  item?: unknown
}

export type ColumnRender<T = any> = (
  value: unknown,
  record: T,
  context?: ColumnRenderContext
) => React.ReactNode

export interface SimpleColumn<T = any> {
  header: string
  render?: ColumnRender<T>
}

export interface GroupColumnChild<T = any> {
  key: string
  header: string
  render?: ColumnRender<T>
}

export interface GroupCol<T = any> {
  header: string
  children: GroupColumnChild<T>[]
  maxItems?: number
}

export type ColumnMapValue<T = any> = string | SimpleColumn<T> | GroupCol<T>

export type ColumnsMap<T = any> = Record<string, ColumnMapValue<T>>

interface CustomTableProps extends Omit<TableProps<any>, 'onChange'> {
  onChange?: (page: number, size: number) => void
  exportable?: boolean
  columnsMap?: ColumnsMap
  exportInitialValues?: Partial<ExportFormValue>
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
      columnsMap,
      exportInitialValues,
      ...props
    },
    ref
  ) => {
    const [modalState, setModalState] = useState(false)

    return (
      <>
        <Container>
          <ConditionalComponent condition={!!columnsMap}>
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
            initialValues={exportInitialValues}
          />
        </ConditionalComponent>
      </>
    )
  }
)

export default CustomTable
