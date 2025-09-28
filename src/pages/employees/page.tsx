import React, { useCallback, useEffect, useState } from 'react'
import EmployeesTable from './components/EmployeesTable'
import CustomCard from 'src/components/custom/CustomCard'
import { App, Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import ConditionalComponent from 'src/components/ConditionalComponent'
import EmployeesForm from './components/EmployeesForm'
import { useGetPaginatedStaffMutation } from 'src/services/staff/userGetPaginatedStaffMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useStaffStore } from 'src/store/staff.store'
import { AdvancedCondition } from 'src/types/general'
import { Staff } from 'src/services/staff/staff.types'
import { useUpdateStaffMutation } from 'src/services/staff/useUpdateStaffMutation'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetOneStaffQuery } from 'src/services/staff/useGetOneStaffQuery'

const EmployeesPage: React.FC = () => {
  const [form] = Form.useForm()
  const { notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [staffId, setStaffId] = useState<number>()
  const [employeesModalState, setEmployeesModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useStaffStore()

  const { mutate: getStaffPagination, isPending: isGetStaffPending } =
    useGetPaginatedStaffMutation()
  const { data: staff } = useGetOneStaffQuery(staffId)
  const { mutateAsync: updateStaff, isPending: isUpdatePending } =
    useUpdateStaffMutation()

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

  const toggleModalState = () => setEmployeesModalState(!employeesModalState)

  useEffect(() => {
    if (staff?.STAFF_ID) {
      toggleModalState()
    }
  }, [staff])

  useEffect(() => {
    if (employeesModalState) return

    handleSearch()
  }, [employeesModalState])

  const handleOnChangeState = async (record: Staff) => {
    try {
      await updateStaff({
        STAFF_ID: record.STAFF_ID,
        STATE: record.STATE === 'A' ? 'I' : 'A',
      })

      notification.success({
        message: 'Operación exitosa',
        description: 'El estado del empleado fue actualizado exitosamente.',
      })
      handleSearch()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <>
      <CustomSpin spinning={isGetStaffPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Empleado'}
            searchPlaceholder={'Buscar empleados...'}
            onSearch={setSearchKey}
            onCreate={toggleModalState}
            filterContent={<>Plantilla de filtro</>}
          />
          <EmployeesTable
            onChange={handleSearch}
            onUpdate={handleOnChangeState}
            onEdit={setStaffId}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={employeesModalState}>
        <EmployeesForm
          record={staff}
          open={employeesModalState}
          onClose={() => {
            toggleModalState()
            setStaffId(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default EmployeesPage
