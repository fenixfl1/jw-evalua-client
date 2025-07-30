import React, { useCallback, useEffect, useState } from 'react'
import RolesTable from './components/RolesTable'
import { Form } from 'antd'
import CustomCard from 'src/components/custom/CustomCard'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import ConditionalComponent from 'src/components/ConditionalComponent'
import RolesForm from './components/RolesForm'
import { useGetRolePaginationMutation } from 'src/services/roles/useGetRolePaginationMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import { Role } from 'src/services/roles/role.type'
import { AdvancedCondition } from 'src/types/general'
import { useRoleStore } from 'src/store/role.store'

const RolesPage: React.FC = () => {
  const [form] = Form.useForm()
  const [rolesModalState, setRolesModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useRoleStore()

  const { mutate: getRoles, isPending: isGetRolesPending } =
    useGetRolePaginationMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      const condition: AdvancedCondition<Role>[] = [
        {
          value: 'A',
          operator: '=',
          field: 'STATE',
        },
      ]

      if (debounce) {
        condition.push({
          value: debounce,
          operator: 'LIKE',
          field: 'NAME',
        })
      }

      getRoles({ page, size, condition })
    },
    [debounce]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setRolesModalState(!rolesModalState)

  return (
    <>
      <CustomSpin spinning={isGetRolesPending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Rol'}
            searchPlaceholder={'Buscar roles...'}
            onSearch={setSearchKey}
            onCreate={toggleModalState}
            filterContent={<>Plantilla de filtro</>}
          />
          <RolesTable onChange={handleSearch} />
        </CustomCard>
      </CustomSpin>
      <ConditionalComponent condition={rolesModalState}>
        <RolesForm open={rolesModalState} onClose={toggleModalState} />
      </ConditionalComponent>
    </>
  )
}

export default RolesPage
