import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form } from 'antd'
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
import SmartTable from 'src/components/SmartTable'
import { ColumnsType } from 'antd/es/table'
import formatter from 'src/utils/formatter'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import StateSelector from 'src/components/StateSelector'
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import CustomCol from 'src/components/custom/CustomCol'
import dayjs from 'dayjs'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import CustomSelect from 'src/components/custom/CustomSelect'
import { useModuleStore } from 'src/store/module.store'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
    CREATED_AT__BETWEEN: undefined,
  },
}

const EmployeesPage: React.FC = () => {
  const [form] = Form.useForm()
  const { notification, modal } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [staffId, setStaffId] = useState<number>()
  const [employeesModalState, setEmployeesModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)
  const [searchModuleKey, setSearchModuleKey] = useState('')
  const debounceModule = useDebounce(searchModuleKey)

  const { metadata, staffList } = useStaffStore()

  const { mutate: getStaffPagination, isPending: isGetStaffPending } =
    useGetPaginatedStaffMutation()
  const { data: staff } = useGetOneStaffQuery(staffId)
  const { mutateAsync: updateStaff, isPending: isUpdatePending } =
    useUpdateStaffMutation()
  const { mutate: getModules } = useGetPaginatedModulesMutation()

  const { workModules } = useModuleStore()

  const moduleOptions = useMemo(() => {
    const arr = workModules.map((item) => ({
      label: item.DESCRIPTION,
      value: item.MODULE_ID,
    }))

    arr.push({ label: 'TODOS', value: false } as never)
    arr.push({ label: 'SIN MÓDULO', value: true } as never)

    return arr
  }, workModules)

  const handleGetModules = useCallback(() => {
    const condition: AdvancedCondition[] = [
      { value: 'A', field: 'STATE', operator: '=' },
    ]

    if (debounceModule) {
      condition.push({
        value: debounceModule,
        field: 'FILTER',
        operator: 'LIKE',
      })
    }

    getModules({
      page: 1,
      size: 10,
      condition,
    })
  }, [debounceModule])

  useEffect(handleGetModules, [handleGetModules])

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const filterConditions = getConditionFromForm(FILTER)

      const condition: AdvancedCondition<Staff>[] = [...filterConditions]

      if (debounce) {
        condition.push({
          value: debounce,
          operator: 'LIKE',
          field: ['IDENTITY_DOCUMENT', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
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
    modal.confirm({
      title: 'Aviso, Cambio de estado',
      onOk: async () => {
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
      },
      content: (
        <p>
          Seguro que desea cambiar el estado del empleado <br />
          <strong>
            "{record.NAME} {record.LAST_NAME}"
          </strong>
          ?
        </p>
      ),
    })
  }

  const columns: ColumnsType<Staff> = [
    {
      dataIndex: 'STAFF_ID',
      key: 'STAFF_ID',
      title: 'Código',
      align: 'center',
      width: '5%',
    },
    {
      dataIndex: 'NAME',
      key: 'NAME',
      title: 'NOMBRE',
    },
    {
      dataIndex: 'LAST_NAME',
      key: 'LAST_NAME',
      title: 'Apellidos',
    },
    {
      dataIndex: 'IDENTITY_DOCUMENT',
      key: 'IDENTITY_DOCUMENT',
      title: 'Cédula',
      render: (value) => formatter({ value, format: 'document' }),
    },
    {
      dataIndex: 'EMAIL',
      key: 'EMAIL',
      title: 'Correo',
    },
    {
      dataIndex: 'CREATED_AT',
      key: 'CREATED_AT',
      title: 'Fecha de Registro',
      render: (value) => formatter({ value, format: 'date' }),
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

  const filter = (
    <CustomRow>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Estado'}
          name={['FILTER', 'STATE__IN']}
          labelCol={{ span: 24 }}
        >
          <StateSelector allowClear={false} />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Fecha de Registro'}
          name={['FILTER', 'CREATED_AT__BETWEEN']}
          labelCol={{ span: 24 }}
        >
          <CustomRangePicker width={'100%'} maxDate={dayjs()} />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Módulo'}
          name={['FILTER', 'MODULE_ID__EQ']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            onSearch={setSearchModuleKey}
            placeholder={'Seleccionar Módulo'}
            options={moduleOptions}
          />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )

  const columnsMap = {
    STAFF_ID: 'Código',
    NAME: 'Nombre',
    LAST_NAME: 'Apellido',
    IDENTITY_DOCUMENT: 'Doc. Identidad',
    EMAIL: 'Correo',
    STATE: 'Estado',
  }

  return (
    <>
      <CustomSpin spinning={isGetStaffPending || isUpdatePending}>
        <SmartTable
          dataSource={staffList}
          columns={columns}
          metadata={metadata}
          onChange={handleSearch}
          createText={'Nuevo Empleado'}
          filter={filter}
          form={form}
          initialFilter={initialFilter}
          loading={isGetStaffPending}
          onCreate={toggleModalState}
          onEdit={(record) => setStaffId(record.STAFF_ID)}
          onUpdate={(record) => handleOnChangeState(record)}
          onSearch={setSearchKey}
          rowKey={'STAFF_ID'}
          columnsMap={columnsMap}
        />
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
