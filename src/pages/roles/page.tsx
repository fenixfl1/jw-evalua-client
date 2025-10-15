import React, { useCallback, useEffect, useState } from 'react'
import { App, Form } from 'antd'
import useDebounce from 'src/hooks/use-debounce'
import ConditionalComponent from 'src/components/ConditionalComponent'
import RolesForm from './components/RolesForm'
import { useGetRolePaginationMutation } from 'src/services/roles/useGetRolePaginationMutation'
import { Role } from 'src/services/roles/role.type'
import { AdvancedCondition } from 'src/types/general'
import { useRoleStore } from 'src/store/role.store'
import { ColumnsType } from 'antd/lib/table'
import SmartTable from 'src/components/SmartTable'
import CustomRow from 'src/components/custom/CustomRow'
import StateSelector from 'src/components/StateSelector'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomCol from 'src/components/custom/CustomCol'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useUpdateRoleMutation } from 'src/services/roles/useUpdateRoleMutation'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetOneRoleQuery } from 'src/services/roles/useGetOneRoleQuery'
import { ColumnsMap } from 'src/components/custom/CustomTable'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const RolesPage: React.FC = () => {
  const { modal } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const [roleId, setRoleId] = useState<number>()
  const [rolesModalState, setRolesModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata, roleList, role } = useRoleStore()

  const { isLoading: isGetOneRoleFetching } = useGetOneRoleQuery(roleId)
  const { mutate: getRoles, isPending: isGetRolesPending } =
    useGetRolePaginationMutation()
  const { mutateAsync: updateRole, isPending: isUpdatePending } =
    useUpdateRoleMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (rolesModalState) return
      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const filterCondition = getConditionFromForm(FILTER)
      const condition: AdvancedCondition<Role>[] = [...filterCondition]

      if (debounce) {
        condition.push({
          value: debounce,
          operator: 'LIKE',
          field: 'NAME',
        })
      }

      getRoles({ page, size, condition })
    },
    [debounce, rolesModalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setRolesModalState(!rolesModalState)

  useEffect(() => {
    if (role?.ROLE_ID) {
      toggleModalState()
    }
  }, [role])

  const handleChangeState = async (record: Role) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del rol?',
      onOk: async () => {
        try {
          await updateRole({
            ROLE_ID: record.ROLE_ID,
            STATE: record.STATE === 'A' ? 'I' : 'A',
          })
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

  const columns: ColumnsType<Role> = [
    {
      dataIndex: 'ROLE_ID',
      key: 'ROLE_ID',
      title: 'Código',
      width: '5%',
      align: 'center',
    },
    {
      dataIndex: 'NAME',
      key: 'NAME',
      title: 'Nombre',
    },
    {
      dataIndex: 'DESCRIPTION',
      key: 'DESCRIPTION',
      title: 'Descripción',
    },
    {
      dataIndex: 'STATE',
      key: 'STATE',
      title: 'Estado',
      width: '10%',
      align: 'center',
      render: (value) => (value === 'A' ? 'ACTIVO' : 'INACTIVO'),
    },
  ]

  const columnsMap: ColumnsMap = {
    ROLE_ID: 'Código',
    NAME: 'Nombre',
    DESCRIPTION: 'Descripción',
    CREATED_AT: 'F. Creación',
    CREATOR: 'Creador',
    STATE: {
      header: 'Estado',
      render: (value) => (value === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const filter = (
    <CustomRow>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Estado'}
          name={['FILTER', 'STATE__IN']}
          labelCol={{ span: 24 }}
        >
          <StateSelector />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )

  return (
    <>
      <SmartTable
        form={form}
        loading={isGetRolesPending || isUpdatePending || isGetOneRoleFetching}
        columns={columns}
        dataSource={roleList}
        metadata={metadata}
        createText={'Nuevo Rol'}
        searchPlaceholder={'Buscar roles...'}
        onChange={handleSearch}
        onCreate={toggleModalState}
        onSearch={setSearchKey}
        onEdit={(record) => setRoleId(record?.ROLE_ID)}
        onUpdate={handleChangeState}
        filter={filter}
        initialFilter={initialFilter}
        columnsMap={columnsMap}
      />
      <ConditionalComponent condition={rolesModalState}>
        <RolesForm
          open={rolesModalState}
          onClose={() => {
            toggleModalState()
            setRoleId(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default RolesPage
