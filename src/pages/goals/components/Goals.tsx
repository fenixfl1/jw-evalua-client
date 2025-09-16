import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import GoalForm from './GoalForm'
import ModuleGoalForm from './ModuleGoalForm'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomProgress from 'src/components/custom/CustomProgress'
import CustomDivider from 'src/components/custom/CustomDivider'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useCreateGoalMutation } from 'src/services/goals/useCreateGoalMutation'
import { useGetModuleSummaryPaginationMutation } from 'src/services/goals/useGetModuleSummaryPaginationMutation'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import SmartTable from 'src/components/SmartTable'
import { ModuleSummaryDetail } from 'src/services/goals/types'
import { AdvancedCondition } from 'src/types/general'
import { useGoalStore } from 'src/store/goal.store'
import useDebounce from 'src/hooks/use-debounce'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { WorkModule } from 'src/services/work_modules/module.types'
import GoalActions from './GoalActions'
import StateSelector from 'src/components/StateSelector'

type GoalStatus =
  | 'Activa'
  | 'En curso'
  | 'Atrasada'
  | 'Completada'
  | 'Archivada'

dayjs.extend(weekOfYear)
const currentPeriod = Number(
  `${dayjs().year()}${String(dayjs().week()).padStart(2, '0')}`
)
const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    PERIOD_ID__EQ: currentPeriod,
  },
}

export type TeamGoal = {
  id: number
  name: string
  unit: string
  target: number
  actual: number
  weight: number
  groupId: number // MODULE_ID
  periodId: number
  periodName: string
  owner: string
  status: GoalStatus
  dueDate?: string
  updatedAt: string
  description?: string
}

type GoalsProps = {
  module: WorkModule
}

const Goals: React.FC<GoalsProps> = ({ module }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const [createModalState, setCreateModalState] = useState(false)
  const [createServerModal, setCreateServerModal] = useState(false)
  dayjs.extend(weekOfYear)

  const periodOptions = useMemo(() => {
    const year = dayjs().year()
    return Array.from({ length: 53 }, (_, i) => {
      const w = i + 1
      const value = Number(`${year}${String(w).padStart(2, '0')}`)
      return { value, label: `${year}-W${String(w).padStart(2, '0')}` }
    })
  }, [])

  const { mutateAsync: createGoal } = useCreateGoalMutation()

  const { mutate: getSummary, isPending: isGetSummaryPending } =
    useGetModuleSummaryPaginationMutation()

  const { metadata, moduleSummary } = useGoalStore()

  const toggleModalState = () => setCreateModalState(!createModalState)
  const toggleCreateServerModal = () => setCreateServerModal((s) => !s)
  const [editing, setEditing] = useState<TeamGoal | null>(null)
  const [open, setOpen] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  useEffect(() => {
    if (createModalState) setOpen(true)
  }, [createModalState])

  const filter = (
    <>
      <CustomFormItem
        label={'Estado'}
        name={['FILTER', 'STATE__IN']}
        labelCol={{ span: 24 }}
      >
        <StateSelector />
      </CustomFormItem>
      <CustomFormItem
        labelCol={{ span: 24 }}
        name={['FILTER', 'PERIOD__EQ']}
        label={'Periodo'}
      >
        <CustomSelect
          allowClear
          placeholder={'Periodo (YYYYWW)'}
          options={periodOptions}
        />
      </CustomFormItem>
    </>
  )

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      const { FILTER } = form.getFieldsValue()

      const condition: AdvancedCondition[] = []
      const filter = getConditionFromForm(FILTER)

      if (filter.length) {
        condition.push(...filter)
      }

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      getSummary({ page, size, condition })
    },
    [debounce]
  )

  useEffect(handleSearch, [handleSearch])

  const columns: ColumnsType<ModuleSummaryDetail> = [
    {
      align: 'center',
      dataIndex: 'GOAL_ID',
      key: 'GOAL_ID',
      title: 'Código',
      width: '5%',
    },
    { dataIndex: 'DESCRIPTION', key: 'DESCRIPTION', title: 'Meta' },
    {
      key: 'period',
      title: 'Periodo',
      dataIndex: 'PERIOD',
      render: (value: number) =>
        periodOptions.find((item) => item.value === value).label,
    },
    {
      dataIndex: 'TARGET_VALUE',
      key: 'TARGET_VALUE',
      title: 'Objetivo',
      width: '12%',
    },
    {
      dataIndex: 'ACTUAL_VALUE',
      key: 'ACTUAL_VALUE',
      title: 'Real',
      width: '12%',
    },
    {
      dataIndex: 'WEIGHT',
      key: 'WEIGHT',
      title: 'Peso %',
      width: '10%',
    },
    {
      dataIndex: 'COMPLIANCE',
      key: 'COMPLIANCE',
      title: 'Progreso',
      render: (value: number) => {
        return (
          <CustomProgress
            percent={Math.round(Number(Math.min(value || 0, 100).toFixed(2)))}
            showInfo
          />
        )
      },
    },
  ]

  return (
    <>
      <CustomSpace>
        <GoalActions module={module} moduleSummary={moduleSummary} />

        <CustomDivider />
        <SmartTable
          loading={isGetSummaryPending}
          columns={columns}
          createText={'Crear meta'}
          dataSource={moduleSummary}
          filter={filter}
          form={form}
          initialFilter={initialFilter}
          metadata={metadata}
          onChange={handleSearch}
          onCreate={toggleCreateServerModal}
          onSearch={setSearchKey}
          rowKey={'GOAL_ID'}
          searchPlaceholder={'Buscar metas...'}
          showActions={false}
        />
      </CustomSpace>

      <ConditionalComponent condition={createModalState}>
        <GoalForm
          open={open}
          initial={editing ?? undefined}
          onSubmit={() => null}
          onCancel={() => {
            setOpen(false)
            setEditing(null)
            toggleModalState()
          }}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={createServerModal}>
        <ModuleGoalForm
          open={createServerModal}
          onCancel={toggleCreateServerModal}
          onSubmit={async (values) => {
            await createGoal({
              ...values,
              MODULE_ID: module.MODULE_ID,
              SCOPE: 'module',
            })
            // await refetchModuleGoals()
            message.success('Meta creada')
            toggleCreateServerModal()
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default Goals
