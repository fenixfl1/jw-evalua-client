import React, { useCallback, useEffect, useState } from 'react'
import EmployeesTable from './components/EmployeesTable'
import CustomCard from 'src/components/custom/CustomCard'
import { Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import ConditionalComponent from 'src/components/ConditionalComponent'
import EmployeesForm from './components/EmployeesForm'
import { useGetPaginatedStaffMutation } from 'src/services/staff/userGetPaginatedStaffMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useStaffStore } from 'src/store/staff.store'
import { AdvancedCondition } from 'src/types/general'
import { Staff } from 'src/services/staff/staff.types'

const EmployeesPage: React.FC = () => {
  const [form] = Form.useForm()
  const [employeesModalState, setEmployeesModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useStaffStore()

  const { mutate: getStaffPagination, isPending: isGetStaffPending } =
    useGetPaginatedStaffMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      const condition: AdvancedCondition<Staff>[] = [
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
          field: ['IDENTITY_DOCUMENT', 'NAME', 'LAST_NAME'],
        })
      }

      getStaffPagination({ page, size, condition })
    },
    [debounce]
  )

  useEffect(handleSearch, [handleSearch])

  useEffect(() => {
    if (employeesModalState) return

    handleSearch()
  }, [employeesModalState])

  const toggleModalState = () => setEmployeesModalState(!employeesModalState)

  return (
    <>
      <CustomSpin spinning={isGetStaffPending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Empleado'}
            searchPlaceholder={'Buscar empleados...'}
            onSearch={setSearchKey}
            onCreate={toggleModalState}
            filterContent={<>Plantilla de filtro</>}
          />
          <EmployeesTable />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={employeesModalState}>
        <EmployeesForm open={employeesModalState} onClose={toggleModalState} />
      </ConditionalComponent>
    </>
  )
}

export default EmployeesPage
