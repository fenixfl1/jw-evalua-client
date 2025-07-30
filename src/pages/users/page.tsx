import React, { useCallback, useEffect, useState } from 'react'
import UserList from './components/UserList'
import { Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import CustomCard from 'src/components/custom/CustomCard'
import UserForm from './components/UserForm'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'

const UserPage: React.FC = () => {
  const [form] = Form.useForm()
  const [userModalState, setUserModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useUserStore()

  const { mutate: getUserPagination, isPending: isGetUserPending } =
    useGetUserPaginationMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (userModalState) return
      const condition: AdvancedCondition[] = [
        {
          value: 'A',
          field: 'STATE',
          operator: '=',
        },
      ]

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      getUserPagination({ page, size, condition })
    },
    [debounce, userModalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setUserModalState(!userModalState)

  return (
    <>
      <CustomSpin spinning={isGetUserPending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Usuario'}
            searchPlaceholder={'Buscar usuarios...'}
            onSearch={setSearchKey}
            onCreate={toggleModalState}
            filterContent={<>Plantilla de filtro</>}
          />

          <UserList />
        </CustomCard>
      </CustomSpin>
      <ConditionalComponent condition={userModalState}>
        <UserForm open={userModalState} onClose={toggleModalState} />
      </ConditionalComponent>
    </>
  )
}

export default UserPage
