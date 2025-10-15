import { App, Form } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React, { useCallback, useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import SmartTable from 'src/components/SmartTable'
import useDebounce from 'src/hooks/use-debounce'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { Goal } from 'src/services/goals/types'
import { useGetGoalPaginationMutation } from 'src/services/goals/useGetGoalPaginationMutation'
import { useGoalStore } from 'src/store/goal.store'
import { AdvancedCondition } from 'src/types/general'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import GoalForm from './components/GoalForm'
import { useUpdateGoalMutation } from 'src/services/goals/useUpdateGoalMutation'
import { useCustomModal } from 'src/hooks/use-custom-modal'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import StateSelector from 'src/components/StateSelector'
import CustomCol from 'src/components/custom/CustomCol'
import formatter from 'src/utils/formatter'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import { ColumnsMap } from 'src/components/custom/CustomTable'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const Page: React.FC = () => {
  const [form] = Form.useForm()
  const startDate = Form.useWatch(['FILTER', 'START_DATE__GTE'], form)
  const { notification } = App.useApp()
  const { confirmModal } = useCustomModal()
  const [errorHandler] = useErrorHandler()
  const [selectedGoal, setSelectedGoal] = useState<Goal>()
  const [shouldUpdate, setShouldUpdate] = useState<boolean>()
  const [goalModalState, setGoalModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)
  const { mutate: getGoals, isPending: isGetGoalsPending } =
    useGetGoalPaginationMutation()
  const { mutateAsync: updateGoal, isPending: isUpdatePending } =
    useUpdateGoalMutation()

  const { goalMetadata: metadata, goals } = useGoalStore()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      try {
        const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
        const filterConditions = getConditionFromForm(FILTER)

        const condition: AdvancedCondition<Goal>[] = [...filterConditions]

        if (debounce) {
          condition.push({
            value: debounce,
            operator: 'LIKE',
            field: ['GOAL_ID', 'DESCRIPTION'],
          })
        }

        getGoals({ condition, page, size })
      } catch (error) {
        errorHandler(error)
      }
    },
    [debounce, shouldUpdate]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModalState = () => setGoalModalState(!goalModalState)

  const handleUpdate = async (record: Goal) => {
    confirmModal({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado de esta meta?',
      onOk: async () => {
        try {
          const description = await updateGoal({
            GOAL_ID: record.GOAL_ID,
            STATE: record.STATE === 'A' ? 'I' : 'A',
          })

          setShouldUpdate(!shouldUpdate)
          notification.success({
            message: 'Operación exitosa',
            description,
          })
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

  const handleEdit = async (record: Goal) => {
    try {
      setSelectedGoal(record)
      toggleModalState()
    } catch (error) {
      errorHandler(error)
    }
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
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Fecha Inicial'}
          name={['FILTER', 'START_DATE__GTE']}
          labelCol={{ span: 24 }}
        >
          <CustomDatePicker width={'100%'} />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Fecha Final'}
          name={['FILTER', 'END_DATE__LTE']}
          labelCol={{ span: 24 }}
        >
          <CustomDatePicker
            minDate={startDate ? startDate : undefined}
            width={'100%'}
          />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )

  const columns: ColumnsType<Goal> = [
    {
      dataIndex: 'GOAL_ID',
      key: 'GOAL_ID',
      title: 'ID',
    },
    {
      dataIndex: 'DESCRIPTION',
      key: 'DESCRIPTION',
      title: 'Descripción',
    },
    {
      dataIndex: 'TARGET_VALUE',
      key: 'TARGET_VALUE',
      title: 'Objetivo',
      render: (value) => formatter({ value, format: 'currency' }),
    },
    {
      dataIndex: 'WEIGHT',
      key: 'WEIGHT',
      title: 'Peso %',
      render: (value) => formatter({ value, format: 'percentage' }),
    },
    {
      title: 'Plazo',
      children: [
        {
          dataIndex: 'START_DATE',
          key: 'START_DATE',
          title: 'Fecha Inicio',
          align: 'center',
          render: (value) => formatter({ value, format: 'date' }),
        },
        {
          dataIndex: 'END_DATE',
          key: 'END_DATE',
          title: 'Fecha Fin',
          align: 'center',
          render: (value) => formatter({ value, format: 'date' }),
        },
      ],
    },
  ]

  const columnsMap: ColumnsMap<Goal> = {
    GOAL_ID: 'ID',
    DESCRIPTION: 'Descripción',
    START_DATE: 'Fecha Inicial',
    END_DATE: 'Fecha Final',
    WEIGHT: 'Peso %',
    TARGET_VALUE: {
      header: 'Objetivo',
      render: (value: string) => formatter({ value, format: 'currency' }),
    },
    CREATED_AT: 'Fecha Creación',
    STATE: {
      header: 'Estado',
      render: (value) => (value === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  return (
    <>
      <SmartTable
        columns={columns}
        createText={'Crear Meta'}
        dataSource={goals}
        filter={filter}
        form={form}
        initialFilter={initialFilter}
        loading={isUpdatePending || isGetGoalsPending}
        onChange={handleSearch}
        onCreate={toggleModalState}
        onEdit={handleEdit}
        onSearch={setSearchKey}
        onUpdate={handleUpdate}
        searchPlaceholder={'Buscar metas...'}
        columnsMap={columnsMap}
        metadata={metadata}
      />

      <ConditionalComponent condition={goalModalState}>
        <GoalForm
          record={selectedGoal}
          open={goalModalState}
          onCancel={() => {
            toggleModalState()
            setSelectedGoal(undefined)
            setShouldUpdate(!shouldUpdate)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
