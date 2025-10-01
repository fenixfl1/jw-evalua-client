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
import CustomCard from 'src/components/custom/CustomCard'
import { CustomText } from 'src/components/custom/CustomParagraph'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useSearchParams } from 'react-router-dom'
import CustomSpin from 'src/components/custom/CustomSpin'

type GoalStatus =
  | 'Activa'
  | 'En curso'
  | 'Atrasada'
  | 'Completada'
  | 'Archivada'

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
const current = Number(
  `${dayjs().year()}${String(dayjs().week()).padStart(2, '0')}`
)

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    PERIOD__EQ: current,
  },
}

type GoalsProps = {
  module: WorkModule
}

const Goals: React.FC<GoalsProps> = ({ module }) => {
  const [searchParams] = useSearchParams()
  const { message } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const period =
    Form.useWatch(['FILTER', 'PERIOD__EQ'], form) ??
    initialFilter.FILTER.PERIOD__EQ

  const [shouldUpdate, setShouldUpdate] = useState<boolean>()
  const [createModalState, setCreateModalState] = useState(false)
  const [createServerModal, setCreateServerModal] = useState(false)
  dayjs.extend(weekOfYear)

  const [periodOptions, currentPeriod] = useGetPeriods()

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
        rules={[{ required: true }]}
      >
        <StateSelector />
      </CustomFormItem>
      <CustomFormItem
        labelCol={{ span: 24 }}
        name={['FILTER', 'PERIOD__EQ']}
        initialValue={currentPeriod}
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
      if (createServerModal) return
      try {
        const data = form.getFieldsValue()
        const { FILTER } = Object.keys(data ?? {}).length ? data : initialFilter

        const condition: AdvancedCondition[] = [
          {
            value: searchParams.get('moduleId') ?? module.MODULE_ID,
            field: 'MODULE_ID',
            operator: '=',
          },
        ]

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
      } catch (error) {
        errorHandler(error)
      }
    },
    [debounce, shouldUpdate, searchParams, createServerModal]
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

  const generalProgress = useMemo(() => {
    if (!moduleSummary.length) return 0

    const data = moduleSummary.filter(
      (item) => item.PERIOD === (period ?? currentPeriod)
    )

    if (!data.length) return 0

    const totals = data.reduce(
      (acc, summary) => {
        const weight = Number(summary.WEIGHT ?? 0)
        const compliance = Number(summary.COMPLIANCE ?? 0)

        acc.totalWeight += weight
        acc.weightedCompliance += compliance * weight
        acc.totalCompliance += compliance

        return acc
      },
      { totalWeight: 0, weightedCompliance: 0, totalCompliance: 0 }
    )

    const complianceByWeight =
      totals.totalWeight > 0
        ? totals.weightedCompliance / totals.totalWeight
        : totals.totalCompliance / data.length

    const normalized = Number.isFinite(complianceByWeight)
      ? complianceByWeight
      : 0

    return Math.max(0, Math.min(normalized, 100))
  }, [moduleSummary, period, currentPeriod])

  const columnsMap = {
    GOAL_ID: 'ID',
    DESCRIPTION: 'Descripción',
    PERIOD: 'Periodo',
    TARGET_VALUE: 'Objetivo',
    ACTUAL_VALUE: 'Valor Actual',
    WEIGHT: 'Peso %',
    COMPLIANCE: 'Progreso %',
  }

  return (
    <CustomSpin spinning={isGetSummaryPending}>
      <CustomSpace>
        <CustomCard>
          <GoalActions
            module={module}
            shouldUpdate={createServerModal}
            onFinish={() => setShouldUpdate(!shouldUpdate)}
          />
        </CustomCard>
        <CustomCard shadow>
          <CustomSpace size={'small'}>
            <CustomText strong>
              Progreso general del módulo para la semana{' '}
              {periodOptions.find((item) => item.value === period)?.label}
            </CustomText>
            <CustomText type={'secondary'}>{module.DESCRIPTION}</CustomText>
            <CustomProgress
              percent={Number(generalProgress.toFixed(2))}
              showInfo
              status={generalProgress >= 100 ? 'success' : undefined}
            />
          </CustomSpace>
        </CustomCard>
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
          exportable
          columnsMap={columnsMap}
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
            try {
              await createGoal({
                ...values,
                MODULE_ID: module.MODULE_ID,
                SCOPE: 'module',
              })
              message.success('Meta creada')
              setShouldUpdate(!shouldUpdate)
              toggleCreateServerModal()
            } catch (error) {
              errorHandler(error)
            }
          }}
        />
      </ConditionalComponent>
    </CustomSpin>
  )
}

export default Goals
