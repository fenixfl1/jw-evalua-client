/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnsType } from 'antd/lib/table'
import React, { useMemo } from 'react'
import { Metadata } from 'src/types/general'
import CustomSpace from './custom/CustomSpace'
import CustomTooltip from './custom/CustomTooltip'
import CustomButton from './custom/CustomButton'
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons'
import CustomTable, { ColumnsMap } from './custom/CustomTable'
import { getTablePagination } from 'src/utils/table-pagination'
import CustomCard from './custom/CustomCard'
import CustomCol from './custom/CustomCol'
import CustomRow from './custom/CustomRow'
import CustomSearch from './custom/CustomSearch'
import { FormInstance, TableProps } from 'antd'
import ConditionalComponent from './ConditionalComponent'
import CustomSpin from './custom/CustomSpin'
import CustomPopover from './custom/CustomPopover'
import FilterTemplate from './FilterTemplate'
import CustomDivider from './custom/CustomDivider'

interface SmartTableProps {
  columns?: ColumnsType<any>
  createText?: string
  dataSource?: unknown[]
  expandable?: TableProps['expandable']
  filter?: React.ReactNode
  form?: FormInstance
  initialFilter?: Record<string, unknown>
  loading?: boolean
  metadata?: Metadata
  onChange?: (current?: number, size?: number) => void
  onCreate?: () => void
  onEdit?: (record: any) => void
  onSearch?: (value: string) => void
  onUpdate?: (record: any) => void
  searchPlaceholder?: string
  showActions?: boolean
  rowKey?: string
  showStates?: boolean
  exportable?: boolean
  columnsMap?: ColumnsMap
}

const SmartTable: React.FC<SmartTableProps> = ({
  columns: _columns,
  columnsMap,
  createText = 'Crear',
  dataSource,
  expandable,
  filter,
  form,
  initialFilter,
  loading,
  metadata,
  onChange,
  onCreate,
  onEdit,
  onSearch,
  onUpdate,
  rowKey,
  searchPlaceholder = 'Buscar...',
  showActions = true,
  showStates = true,
}) => {
  const actions: ColumnsType<unknown> = [
    {
      width: '5%',
      dataIndex: 'STATE',
      key: 'ACTIONS',
      title: 'Acciones',
      render: (state: string, record) => (
        <CustomSpace
          direction={'horizontal'}
          split={<CustomDivider type={'vertical'} size={'small'} />}
        >
          <CustomTooltip title={'Editar'}>
            <CustomButton
              disabled={state === 'I'}
              onClick={() => onEdit?.(record)}
              type={'link'}
              icon={<EditOutlined />}
            />
          </CustomTooltip>
          <CustomTooltip title={state === 'A' ? 'Inhabilitar' : 'Habilitar'}>
            <CustomButton
              danger={state === 'A'}
              onClick={() => onUpdate?.(record)}
              type={'link'}
              icon={state === 'A' ? <DeleteOutlined /> : <StopOutlined />}
            />
          </CustomTooltip>
        </CustomSpace>
      ),
    },
  ]

  const content = (
    <FilterTemplate
      onSearch={() => onSearch?.('')}
      onFilter={() => onChange()}
      form={form}
      initialValue={initialFilter}
    >
      {filter}
    </FilterTemplate>
  )

  const columns = useMemo(() => {
    const stateColumn = {
      dataIndex: 'STATE',
      key: 'STATE',
      title: 'Estado',
      width: '6%',
      align: 'center' as never,
      render: (state: string) => (state === 'A' ? 'Activo' : 'Inactivo'),
    }

    const arr = [..._columns]

    if (showStates && !arr.some((col) => col.key === 'STATE')) {
      arr.push(stateColumn)
    }

    if (showActions && !_columns.some((col) => col.key === 'ACTIONS')) {
      return Array.from(new Set([...arr, ...actions]))
    }

    return arr
  }, [_columns, showActions])

  return (
    <>
      <CustomSpin spinning={loading}>
        <CustomCard>
          <CustomSpace size={'large'}>
            <CustomCol xs={24}>
              <CustomRow justify={'space-between'}>
                <ConditionalComponent
                  condition={!!filter}
                  fallback={<CustomCol xs={2} />}
                >
                  <CustomTooltip title={'Filtros'} placement={'left'}>
                    <CustomPopover
                      content={content}
                      title={'Filtros'}
                      trigger={'click'}
                    >
                      <CustomButton
                        size={'large'}
                        type={'text'}
                        icon={<FilterOutlined />}
                      />
                    </CustomPopover>
                  </CustomTooltip>
                </ConditionalComponent>
                <CustomCol xs={14}>
                  <CustomRow justify={'end'} gap={5} wrap={false}>
                    <CustomSearch
                      width={'80%'}
                      placeholder={searchPlaceholder}
                      onChange={(e) => onSearch?.(e.target.value)}
                    />
                    <CustomButton
                      icon={<PlusOutlined />}
                      type={'primary'}
                      onClick={onCreate}
                    >
                      {createText}
                    </CustomButton>
                  </CustomRow>
                </CustomCol>
              </CustomRow>
            </CustomCol>

            <CustomTable
              rowKey={(record) => record[rowKey]}
              columns={columns}
              dataSource={dataSource}
              expandable={expandable}
              onChange={onChange}
              pagination={getTablePagination(metadata)}
              columnsMap={columnsMap}
              rowClassName={(record) =>
                record.STATE === 'I' ? 'custom-table-row-disabled' : undefined
              }
            />
          </CustomSpace>
        </CustomCard>
      </CustomSpin>
    </>
  )
}

export default SmartTable
