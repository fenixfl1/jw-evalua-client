import { Form, ListProps, Table, TableProps } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React, { useCallback, useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import SmartTable from 'src/components/SmartTable'
import useDebounce from 'src/hooks/use-debounce'
import { WorkModule } from 'src/services/work_modules/module.types'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useModuleStore } from 'src/store/module.store'
import { AdvancedCondition } from 'src/types/general'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import ModuleForm from './components/ModuleForm'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { Staff } from 'src/services/staff/staff.types'
import styled from 'styled-components'
import { getAvatarLink } from 'src/utils/get-avatar-link'
import CustomAvatar from 'src/components/custom/CustomAvatar'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomButton from 'src/components/custom/CustomButton'
import { DeleteOutlined } from '@ant-design/icons'
import CustomTooltip from 'src/components/custom/CustomTooltip'

const ListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-left: 100px;
`

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const Page: React.FC = () => {
  const [form] = Form.useForm()
  const [record, setRecord] = useState<WorkModule>()
  const [moduleModalState, setModuleModalState] = useState(false)
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { mutate: getModules, isPending: isGetModulesPending } =
    useGetPaginatedModulesMutation()

  const { metadata, workModules } = useModuleStore()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (moduleModalState) return
      const { FILTER } = form.getFieldsValue()

      const condition: AdvancedCondition[] = []
      const filter = getConditionFromForm(FILTER)

      if (filter.length) {
        condition.concat(filter)
      }

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      getModules({ page, size, condition })
    },
    [debounce, moduleModalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setModuleModalState(!moduleModalState)

  const columns: ColumnsType<WorkModule> = [
    {
      dataIndex: 'MODULE_ID',
      key: 'MODULE_ID',
      title: 'Código',
      width: '5%',
      align: 'center',
    },
    {
      dataIndex: 'DESCRIPTION',
      key: 'DESCRIPTION',
      title: 'Descripción',
    },
    {
      dataIndex: 'SUPERVISOR_NAME',
      key: 'SUPERVISOR_NAME',
      title: 'Supervisor',
    },
    Table.EXPAND_COLUMN,
    {
      dataIndex: 'MEMBERS',
      key: 'MEMBERS',
      title: 'Miembros',
      width: '10%',
      align: 'center',
      render: (value: number[]) => value?.length ?? 0,
    },
  ]

  const filterContent = (
    <CustomRow width={'100%'}>
      <CustomFormItem
        label={'Estado'}
        name={['FILTER', 'STATE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar estados'}
          mode={'multiple'}
          options={[
            { label: 'Activos', value: 'A' },
            { label: 'Inactivos', value: 'I' },
          ]}
        />
      </CustomFormItem>
    </CustomRow>
  )

  const renderMemberItems: ListProps<Staff>['renderItem'] = (item) => {
    return (
      <CustomListItem
        extra={[
          <CustomTooltip title={'Remover Miembro'}>
            <CustomButton type={'link'} danger icon={<DeleteOutlined />} />
          </CustomTooltip>,
        ]}
      >
        <CustomListItemMeta
          avatar={<CustomAvatar src={getAvatarLink(item as never)} />}
          title={
            <CustomText
              type={'secondary'}
            >{`${item.NAME} ${item.LAST_NAME}`}</CustomText>
          }
        />
      </CustomListItem>
    )
  }

  const expandable: TableProps['expandable'] = {
    indentSize: 100,
    rowExpandable: (record: WorkModule) => !!record.MEMBERS?.length,
    expandedRowRender: (record) => {
      return (
        <ListContainer>
          <CustomList
            itemLayout={'vertical'}
            pagination={false}
            dataSource={record.MEMBERS}
            renderItem={renderMemberItems}
          />
        </ListContainer>
      )
    },
  }

  return (
    <>
      <SmartTable
        rowKey={'MODULE_ID'}
        expandable={expandable}
        columns={columns}
        createText={'Nuevo Modulo'}
        dataSource={workModules}
        filter={filterContent}
        form={form}
        initialFilter={initialFilter}
        loading={isGetModulesPending}
        metadata={metadata}
        onChange={handleSearch}
        onSearch={setSearchKey}
        searchPlaceholder={'Buscar módulos...'}
        onCreate={toggleModalState}
        onEdit={(record: WorkModule) => {
          setRecord(record)
          toggleModalState()
        }}
      />

      <ConditionalComponent condition={moduleModalState}>
        <ModuleForm
          record={record}
          open={moduleModalState}
          onClose={toggleModalState}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
