import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import GoalForm from './GoalForm'
import ModuleGoalForm from './ModuleGoalForm'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomProgress from 'src/components/custom/CustomProgress'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useCreateGoalMutation } from 'src/services/goals/useCreateGoalMutation'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import SmartTable from 'src/components/SmartTable'
import useDebounce from 'src/hooks/use-debounce'
import { WorkModule } from 'src/services/work_modules/module.types'
import GoalActions from './GoalActions'
import StateSelector from 'src/components/StateSelector'
import CustomCard from 'src/components/custom/CustomCard'
import { CustomText } from 'src/components/custom/CustomParagraph'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useGetModuleSummaryQuery } from 'src/services/goals/useGetModuleSummaryQuery'
import capitalize from 'src/utils/capitalize'
import { useSearchParams } from 'react-router-dom'
import { useModuleStore } from 'src/store/module.store'
import CustomCollapse from 'src/components/custom/CustomCollapse'

const NUMBER_FORMATTER = new Intl.NumberFormat('es-DO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatNumber = (value: number) =>
  NUMBER_FORMATTER.format(Number.isFinite(value) ? Number(value) : 0)

const getIsoWeekStart = (period: number) => {
  const year = Math.floor(period / 100)
  const week = period % 100

  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dayOfWeek = simple.getDay() === 0 ? 7 : simple.getDay()

  if (dayOfWeek <= 4) {
    simple.setDate(simple.getDate() - dayOfWeek + 1)
  } else {
    simple.setDate(simple.getDate() + 8 - dayOfWeek)
  }

  return dayjs(simple)
}

const getWeekDays = (period: number) => {
  const start = getIsoWeekStart(period)
  return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'))
}

const distributeEvenly = (total: number, size: number) => {
  if (size <= 0) return []

  const base = Math.floor(total / size)
  const remainder = total % size

  return Array.from(
    { length: size },
    (_, index) => base + (index < remainder ? 1 : 0)
  )
}

dayjs.extend(weekOfYear)

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
  groupId: number
  periodId: number
  periodName: string
  owner: string
  status: GoalStatus
  dueDate?: string
  updatedAt: string
  description?: string
}

type ModuleDailyRow = {
  key: string
  GOAL_ID: number
  DESCRIPTION: string
  STATE?: string
  DATE: string
  DAY_LABEL: string
  TARGET_DAILY: number
  TARGET_CUMULATIVE: number
  TARGET_TOTAL: number
  ACTUAL_DAILY: number
  ACTUAL_CUMULATIVE: number
  DAILY_COMPLIANCE: number
  CUMULATIVE_COMPLIANCE: number
}

type ModuleChartPoint = {
  key: string
  label: string
  expected: number
  actual: number
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
  const { message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()

  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)
  const [goalRefreshToken, setGoalRefreshToken] = useState(false)
  const [createModalState, setCreateModalState] = useState(false)
  const [createServerModal, setCreateServerModal] = useState(false)
  const [editing, setEditing] = useState<TeamGoal | null>(null)
  const [open, setOpen] = useState(false)
  const [tablePagination, setTablePagination] = useState({
    currentPage: 1,
    pageSize: 15,
  })

  const toggleModalState = () => setCreateModalState((state) => !state)
  const toggleCreateServerModal = () => setCreateServerModal((state) => !state)

  const [periodOptions, currentPeriod] = useGetPeriods()
  const period = Form.useWatch(['FILTER', 'PERIOD__EQ'], form) ?? currentPeriod
  const stateFilter = Form.useWatch(['FILTER', 'STATE__IN'], form)

  const { mutateAsync: createGoal } = useCreateGoalMutation()
  const {
    data: summaryData,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useGetModuleSummaryQuery(
    module.MODULE_ID ?? Number(searchParams.get('moduleId')),
    period
  )

  const { workModules } = useModuleStore()

  useEffect(() => {
    if (!searchParams.get('moduleId')) {
      setSearchParams({ moduleId: workModules?.[0].MODULE_ID?.toString() })
    }
  }, [workModules])

  useEffect(() => {
    if (createModalState) setOpen(true)
  }, [createModalState])

  const weekDays = useMemo(() => getWeekDays(period), [period])

  const timeline = useMemo(() => {
    if (!summaryData) {
      return {
        rows: [] as ModuleDailyRow[],
        chartData: [] as ModuleChartPoint[],
        totals: { target: 0, actual: 0 },
      }
    }

    const details = [...(summaryData.DETAILS ?? [])].sort(
      (a, b) => (a.GOAL_ID ?? 0) - (b.GOAL_ID ?? 0)
    )

    const moduleTargetDaily = Array(weekDays.length).fill(0)
    const moduleActualDaily = Array(weekDays.length).fill(0)

    const rows = details.flatMap((detail) => {
      const totalTarget = Number(detail.TARGET_VALUE ?? 0)
      const baseDistribution = distributeEvenly(totalTarget, weekDays.length)
      const dailyMap = new Map(
        (detail.DAILY_TARGETS ?? []).map((item) => [
          dayjs(item.TARGET_DATE).format('YYYY-MM-DD'),
          Number(item.TARGET_VALUE ?? 0),
        ])
      )
      const targetDistribution = weekDays.map((day, index) => {
        const key = day.format('YYYY-MM-DD')
        if (!dailyMap.size) {
          return baseDistribution[index] ?? 0
        }
        const stored = dailyMap.get(key)
        return stored !== undefined ? stored : baseDistribution[index] ?? 0
      })
      const logs = detail.PROGRESS_LOGS ?? []
      const actualByDate = logs.reduce((acc, log) => {
        const sourceDate = log.UPDATED_AT ?? log.CREATED_AT
        const dateKey = sourceDate
          ? dayjs(sourceDate).format('YYYY-MM-DD')
          : weekDays[0]?.format('YYYY-MM-DD') ?? ''
        if (!dateKey) {
          return acc
        }
        const total = acc.get(dateKey) ?? 0
        acc.set(dateKey, total + Number(log.ACTUAL_VALUE ?? 0))
        return acc
      }, new Map<string, number>())

      let cumulativeTarget = 0
      let cumulativeActual = 0

      return weekDays.map((day, index) => {
        const dateKey = day.format('YYYY-MM-DD')
        const dailyTarget = targetDistribution[index] ?? 0
        const dailyActual = actualByDate.get(dateKey) ?? 0

        cumulativeTarget += dailyTarget
        cumulativeActual += dailyActual

        moduleTargetDaily[index] += dailyTarget
        moduleActualDaily[index] += dailyActual

        const totalTargetValue = totalTarget
        const cumulativeCompliance =
          totalTargetValue > 0 ? (cumulativeActual / totalTargetValue) * 100 : 0
        const dailyCompliance =
          dailyTarget > 0
            ? (dailyActual / dailyTarget) * 100
            : dailyActual > 0
            ? 100
            : 0

        return {
          key: `${detail.GOAL_ID}-${dateKey}`,
          GOAL_ID: detail.GOAL_ID,
          DESCRIPTION: detail.DESCRIPTION ?? `Meta ${detail.GOAL_ID}`,
          STATE: detail.STATE ?? 'A',
          DATE: dateKey,
          DAY_LABEL: day.format('ddd DD MMM'),
          TARGET_DAILY: dailyTarget,
          TARGET_CUMULATIVE: cumulativeTarget,
          TARGET_TOTAL: totalTargetValue,
          ACTUAL_DAILY: dailyActual,
          ACTUAL_CUMULATIVE: cumulativeActual,
          DAILY_COMPLIANCE: Number(dailyCompliance.toFixed(2)),
          CUMULATIVE_COMPLIANCE: Number(cumulativeCompliance.toFixed(2)),
        } as ModuleDailyRow
      })
    })

    let cumulativeExpected = 0
    let cumulativeActualValue = 0
    const chartData = weekDays.map((day, index) => {
      cumulativeExpected += moduleTargetDaily[index]
      cumulativeActualValue += moduleActualDaily[index]

      return {
        key: day.format('YYYY-MM-DD'),
        label: day.format('ddd DD MMM'),
        expected: Number(cumulativeExpected.toFixed(2)),
        actual: Number(cumulativeActualValue.toFixed(2)),
      } as ModuleChartPoint
    })

    return {
      rows,
      chartData,
      totals: {
        target: moduleTargetDaily.reduce((acc, value) => acc + value, 0),
        actual: moduleActualDaily.reduce((acc, value) => acc + value, 0),
      },
    }
  }, [summaryData, weekDays])

  const { rows, chartData, totals } = timeline

  const filteredRows = useMemo(() => {
    const states =
      Array.isArray(stateFilter) && stateFilter.length
        ? stateFilter
        : ['A', 'I']
    const search = debounce.trim().toLowerCase()

    return [...rows]
      .filter((row) => {
        const matchesState = !states.length || states.includes(row.STATE ?? 'A')
        if (!matchesState) return false
        if (!search) return true
        return (
          row.DESCRIPTION?.toLowerCase().includes(search) ||
          String(row.GOAL_ID).includes(search) ||
          row.DAY_LABEL.toLowerCase().includes(search)
        )
      })
      .sort((a, b) =>
        a.DATE === b.DATE ? a.GOAL_ID - b.GOAL_ID : a.DATE.localeCompare(b.DATE)
      )
  }, [rows, stateFilter, debounce])

  const stateSignature = useMemo(
    () => JSON.stringify(stateFilter ?? []),
    [stateFilter]
  )

  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [debounce, stateSignature, period])

  const handleTableChange = useCallback(
    (page = 1, size = tablePagination.pageSize) => {
      setTablePagination({
        currentPage: page ?? 1,
        pageSize: size ?? tablePagination.pageSize,
      })
    },
    [tablePagination.pageSize]
  )

  const tableMetadata = useMemo(
    () => ({
      currentPage: tablePagination.currentPage,
      pageSize: tablePagination.pageSize,
      totalPages: filteredRows.length,
      totalRows: filteredRows.length,
      count: filteredRows.length,
      links: undefined,
    }),
    [filteredRows.length, tablePagination]
  )

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

  const columns: ColumnsType<ModuleDailyRow> = [
    {
      dataIndex: 'DAY_LABEL',
      key: 'DAY_LABEL',
      title: 'Fecha',
      width: '13%',
      render: (value) => capitalize(value),
    },
    {
      key: 'DESCRIPTION',
      title: 'Meta',
      render: (_, record) => (
        <CustomSpace direction={'vertical'} size={0}>
          <CustomText strong>{record.DESCRIPTION}</CustomText>
          <CustomText type={'secondary'}>Código #{record.GOAL_ID}</CustomText>
        </CustomSpace>
      ),
      width: '22%',
    },
    {
      dataIndex: 'TARGET_DAILY',
      key: 'TARGET_DAILY',
      title: 'Objetivo diario',
      align: 'right',
      render: (value: number) => formatNumber(value),
    },
    {
      dataIndex: 'ACTUAL_DAILY',
      key: 'ACTUAL_DAILY',
      title: 'Real diario',
      align: 'right',
      render: (value: number) => formatNumber(value),
    },
    {
      dataIndex: 'TARGET_CUMULATIVE',
      key: 'TARGET_CUMULATIVE',
      title: 'Objetivo acumulado',
      align: 'right',
      render: (value: number) => formatNumber(value),
    },
    {
      dataIndex: 'ACTUAL_CUMULATIVE',
      key: 'ACTUAL_CUMULATIVE',
      title: 'Real acumulado',
      align: 'right',
      render: (value: number) => formatNumber(value),
    },
    {
      dataIndex: 'DAILY_COMPLIANCE',
      key: 'DAILY_COMPLIANCE',
      title: 'Cumplimiento diario %',
      align: 'right',
      render: (value: number) => `${formatNumber(value)}%`,
    },
    {
      dataIndex: 'CUMULATIVE_COMPLIANCE',
      key: 'CUMULATIVE_COMPLIANCE',
      title: 'Cumplimiento acumulado',
      render: (value: number) => (
        <CustomProgress
          percent={Math.round(Math.min(value || 0, 100))}
          showInfo
        />
      ),
    },
  ]

  const generalProgress = useMemo(() => {
    if (totals.target <= 0) return 0
    const percent = (totals.actual / totals.target) * 100
    return Math.min(Math.max(percent, 0), 100)
  }, [totals])

  const progressSummaryText = useMemo(() => {
    if (totals.target <= 0) {
      return 'Sin objetivo asignado'
    }

    return `${formatNumber(totals.actual)} / ${formatNumber(
      totals.target
    )} unidades`
  }, [totals])

  const columnsMap = {
    DAY_LABEL: 'Fecha',
    GOAL_ID: 'ID',
    DESCRIPTION: 'Meta',
    TARGET_DAILY: 'Objetivo diario',
    ACTUAL_DAILY: 'Real diario',
    TARGET_CUMULATIVE: 'Objetivo acumulado',
    ACTUAL_CUMULATIVE: 'Real acumulado',
    DAILY_COMPLIANCE: 'Cumplimiento diario (%)',
    CUMULATIVE_COMPLIANCE: 'Cumplimiento acumulado (%)',
  }

  const handleGoalActionFinish = useCallback(() => {
    refetchSummary()
    setGoalRefreshToken((state) => !state)
  }, [refetchSummary])

  return (
    <CustomSpin spinning={isSummaryFetching}>
      <CustomSpace>
        <CustomCard>
          <GoalActions
            module={module}
            shouldUpdate={goalRefreshToken}
            onFinish={handleGoalActionFinish}
          />
        </CustomCard>
        <CustomCollapse
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: (
                <CustomText strong>
                  Progreso general del módulo para la semana{' '}
                  {periodOptions.find((item) => item.value === period)?.label}
                </CustomText>
              ),
              children: (
                <CustomSpace>
                  <CustomText>
                    Avance acumulado: {formatNumber(generalProgress)}%
                  </CustomText>
                  <CustomText type={'secondary'}>
                    {progressSummaryText} producidas
                  </CustomText>
                  {chartData.length ? (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis allowDecimals={false} />
                          <RechartsTooltip
                            formatter={(value: number) => [
                              formatNumber(value),
                              '',
                            ]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="expected"
                            name="Objetivo acumulado"
                            stroke="#8884d8"
                            dot
                          />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            name="Real acumulado"
                            stroke="#82ca9d"
                            dot
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <CustomText type={'secondary'}>
                      Sin registros de progreso en este periodo.
                    </CustomText>
                  )}
                </CustomSpace>
              ),
            },
          ]}
        />
        <SmartTable
          loading={isSummaryFetching}
          columns={columns}
          createText={'Crear meta'}
          dataSource={filteredRows}
          filter={filter}
          form={form}
          initialFilter={initialFilter}
          metadata={tableMetadata}
          onChange={handleTableChange}
          onCreate={toggleCreateServerModal}
          onSearch={setSearchKey}
          rowKey={'key'}
          searchPlaceholder={'Buscar metas o fechas...'}
          showActions={false}
          exportable
          columnsMap={columnsMap}
        />
      </CustomSpace>

      <ConditionalComponent condition={createModalState}>
        <GoalForm
          open={open}
          record={(editing as never) ?? undefined}
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
              handleGoalActionFinish()
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
