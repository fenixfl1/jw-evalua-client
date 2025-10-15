/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { List, ListProps } from 'antd'
import { ColumnsMap } from './CustomTable'
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

interface CustomListProps<T> extends ListProps<T> {
  pageSizeOptions?: string[]
  columnsMap?: ColumnsMap
  exportOptions?: Record<string, any>
  ref?: React.ForwardedRef<unknown>
}

const CustomList: React.FC<CustomListProps<any>> = ({
  columnsMap,
  dataSource = [],
  size = 'small',
  itemLayout = 'horizontal',
  pageSizeOptions = ['5', '10', '20', '50', '100'],
  exportOptions,
  ref,
  ...props
}) => {
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
        <List
          dataSource={dataSource}
          itemLayout={itemLayout}
          pagination={{ pageSizeOptions, ...props.pagination }}
          size={size}
          {...props}
        />
      </Container>
      <ConditionalComponent condition={modalState}>
        <ExportOptions
          initialValues={exportOptions}
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

export default CustomList
