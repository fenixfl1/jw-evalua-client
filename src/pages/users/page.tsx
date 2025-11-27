import React, { useCallback, useEffect, useState } from 'react'
import UserList from './components/UserList'
import { App, Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import CustomCard from 'src/components/custom/CustomCard'
import UserForm from './components/UserForm'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useUpdateUserMutation } from 'src/services/users/useUpdateUserMutation'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { User } from 'src/services/users/users.types'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const UserPage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedUser, setSelectedUser] = useState<User>()
  const [userModalState, setUserModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useUserStore()

  const { mutate: getUserPagination, isPending: isGetUserPending } =
    useGetUserPaginationMutation()
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUserMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (userModalState) return
      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()

      const condition: AdvancedCondition[] = []

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      const filter = getConditionFromForm(FILTER)

      getUserPagination({ page, size, condition: [...condition, ...filter] })
    },
    [debounce, userModalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setUserModalState(!userModalState)

  const handleChangeState = (user: User) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del usuario?',
      onOk: async () => {
        try {
          await updateUser({
            USERNAME: user.USERNAME,
            USER_ID: user.USER_ID,
            STATE: user.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'El estado del usuario fue actualizado con éxito.',
          })

          handleSearch()
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

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

  return (
    <>
      <CustomSpin spinning={isGetUserPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Usuario'}
            searchPlaceholder={'Buscar usuarios...'}
            onSearch={setSearchKey}
            onCreate={toggleModalState}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <UserList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              toggleModalState()
              setSelectedUser(record)
            }}
          />
        </CustomCard>
      </CustomSpin>
      <ConditionalComponent condition={userModalState}>
        <UserForm
          user={selectedUser}
          open={userModalState}
          onClose={toggleModalState}
        />
      </ConditionalComponent>
    </>
  )
}

export default UserPage
