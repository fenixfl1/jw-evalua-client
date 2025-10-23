import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Form } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomProgress from 'src/components/custom/CustomProgress'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import SmartTable from 'src/components/SmartTable'
import useDebounce from 'src/hooks/use-debounce'
import { WorkModule } from 'src/services/work_modules/module.types'
import StateSelector from 'src/components/StateSelector'
import { CustomText } from 'src/components/custom/CustomParagraph'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useGetModuleSummaryQuery } from 'src/services/goals/useGetModuleSummaryQuery'
import { useSearchParams } from 'react-router-dom'
import { useModuleStore } from 'src/store/module.store'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import ConditionalComponent from 'src/components/ConditionalComponent'
import AssignGoal from './AssignGoal'
import { useGetModuleSummaryPaginationMutation } from 'src/services/goals/useGetModuleSummaryPaginationMutation'
import { AdvancedCondition } from 'src/types/general'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { dayFormat } from 'src/utils/date-utils'
import { useGoalStore } from 'src/store/goal.store'
import WeeklyQualityChart from './WeeklyQualityChart'
import CustomCard from 'src/components/custom/CustomCard'
import formatter from 'src/utils/formatter'
import { ModuleSummaryDetail } from 'src/services/goals/types'
import { ColumnsMap } from 'src/components/custom/CustomTable'
import CustomButton from 'src/components/custom/CustomButton'
import { FlagOutlined, LineChartOutlined } from '@ant-design/icons'
import ProgressForm from './ProgressForm'
import PeriodSelector from 'src/components/PeriodSelector'
import CustomSelect from 'src/components/custom/CustomSelect'
import capitalize from 'src/utils/capitalize'
import { useGetModuleGoalsQuery } from 'src/services/goals/useGetModuleGoalsQuery'

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

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

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
    STATE__IN: ['A'],
    PERIOD__EQ: current,
    TARGET_DATE__IN: [dayjs()],
  },
}

type GoalsProps = {
  module: WorkModule
}

const Goals: React.FC<GoalsProps> = ({ module }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()

  const [progressModalState, setProgressModalState] = useState<boolean>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)
  const [tablePagination, setTablePagination] = useState({
    currentPage: 1,
    pageSize: 15,
  })

  const [periodOptions, currentPeriod] = useGetPeriods()
  const period = Form.useWatch(['FILTER', 'PERIOD__EQ'], form) ?? currentPeriod
  const stateFilter = Form.useWatch(['FILTER', 'STATE__IN'], form)
  const currentValue: string | undefined = Form.useWatch(
    ['FILTER', 'TARGET_DATE__IN'],
    form
  )

  const { data: goalModules } = useGetModuleGoalsQuery(module.MODULE_ID, period)
  const { mutate: getModuleSummary, isPending: isGetSummaryPending } =
    useGetModuleSummaryPaginationMutation()

  const { data: summaryData, isFetching: isSummaryFetching } =
    useGetModuleSummaryQuery(
      module.MODULE_ID ?? Number(searchParams.get('moduleId')),
      period
    )

  const { workModules } = useModuleStore()
  const { moduleSummary, metadata } = useGoalStore()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (progressModalState || modalState) return
      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const filterConditions = getConditionFromForm(FILTER)

      const condition: AdvancedCondition[] = [
        {
          value: Number(searchParams.get('moduleId')),
          field: 'MODULE_ID',
          operator: '=',
        },
        ...filterConditions,
      ]

      getModuleSummary({ condition, page, size })
    },
    [debounce, searchParams, progressModalState, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  useEffect(() => {
    if (!searchParams.get('moduleId')) {
      setSearchParams({ moduleId: workModules?.[0].MODULE_ID?.toString() })
    }
  }, [workModules])

  const weekDays = useMemo(() => getWeekDays(period), [period])

  const defaultTargetDate = useMemo(() => {
    const today = dayjs()
    // ¿today cae dentro de la semana del período?
    const inWeek = weekDays.some((d) => d.isSame(today, 'day'))
    // si sí, usamos hoy; si no, usamos el primer día de la semana (lunes ISO)
    const chosen = inWeek ? today : weekDays[0] ?? dayjs()
    return chosen.format('YYYY-MM-DD')
  }, [weekDays])

  useEffect(() => {
    const values = form.getFieldsValue()
    const sel = currentValue ?? values?.FILTER?.TARGET_DATE__IN

    // si no hay selección o la selección no está en la nueva semana, seteamos el default
    const inWeek = weekDays.some((d) => d.format('YYYY-MM-DD') === sel)
    if (!inWeek) {
      form.setFields([
        { name: ['FILTER', 'TARGET_DATE__IN'], value: defaultTargetDate },
      ])
    }
  }, [weekDays, defaultTargetDate, form])

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

  const periodLabel = useMemo(() => {
    const selected = periodOptions.find(
      (item) => Number(item.value) === Number(period)
    )
    return selected?.label ?? (period ? String(period) : '')
  }, [period, periodOptions])

  const stateSummary = useMemo(() => {
    if (!Array.isArray(stateFilter) || !stateFilter.length) {
      return 'Todas'
    }
    const labels: Record<string, string> = {
      A: 'Activa',
      I: 'Inactiva',
    }
    const uniqueStates = Array.from(new Set(stateFilter))
    return uniqueStates.map((state) => labels[state] ?? state).join(', ')
  }, [stateFilter])

  const extraHeaderHtml = useMemo(() => {
    const description = module?.DESCRIPTION?.trim()
    const moduleLabel = description
      ? `${description} (ID ${module.MODULE_ID})`
      : `Módulo ${module.MODULE_ID}`
    const lines = [`<p><strong>Modulo:</strong> ${escapeHtml(moduleLabel)}</p>`]
    if (periodLabel) {
      lines.push(`<p><strong>Periodo:</strong> ${escapeHtml(periodLabel)}</p>`)
    }
    lines.push(`<p><strong>Estados:</strong> ${escapeHtml(stateSummary)}</p>`)
    return `<div style="font-size:12px;">${lines.join('')}</div>`
  }, [module.DESCRIPTION, module.MODULE_ID, periodLabel, stateSummary])

  const { rows } = timeline

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

  const toggleModalState = () => setModalState(!modalState)
  const toggleProgressModal = () => setProgressModalState(!progressModalState)

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
        <PeriodSelector
          onClear={() => {
            form.resetFields(['FILTER', 'TARGET_DATE__IN'])
          }}
        />
      </CustomFormItem>
      <CustomFormItem
        label={'Días'}
        labelCol={{ span: 24 }}
        name={['FILTER', 'TARGET_DATE__IN']}
      >
        <CustomSelect
          showSearch
          mode={'multiple'}
          options={weekDays.map((d) => ({
            value: d.format('YYYY-MM-DD'),
            label: `${capitalize(d.format('dddd'))} ${d.format('DD')}`,
          }))}
        />
      </CustomFormItem>
      <CustomFormItem
        label={'Meta'}
        name={['FILTER', 'GOAL_ID__EQ']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          placeholder={'Seleccionar Meta'}
          options={goalModules?.map((goal) => ({
            label: goal.DESCRIPTION,
            value: goal.GOAL_ID,
          }))}
        />
      </CustomFormItem>
    </>
  )

  const columns: ColumnsType<ModuleSummaryDetail> = [
    {
      dataIndex: 'TARGET_DATE',
      key: 'TARGET_DATE',
      title: 'Día',
      width: '13%',
      render: (value) => (
        <span style={{ marginLeft: '10px' }}>{dayFormat(value)}</span>
      ),
    },
    {
      dataIndex: 'DESCRIPTION',
      key: 'DESCRIPTION',
      title: 'Meta',
      width: '22%',
    },
    {
      dataIndex: 'TARGET_VALUE',
      key: 'ACTUAL_DAILY',
      title: 'Real diario',
      align: 'right',
      render: (value) => formatter({ value, format: 'currency' }),
    },
    {
      dataIndex: 'ACTUAL_VALUE',
      key: 'ACTUAL_VALUE',
      title: 'Progreso diario',
      align: 'right',
      render: (value) => formatter({ value, format: 'currency' }),
    },
    {
      dataIndex: 'ACTUAL_VALUE_ACC',
      key: 'ACTUAL_VALUE_ACC',
      title: 'Real acumulado',
      align: 'right',
      render: (value, record) =>
        Number(record.ACTUAL_VALUE) > 0
          ? formatter({ value, format: 'currency' })
          : 0,
    },
    {
      dataIndex: 'COMPLIANCE',
      key: 'COMPLIANCE',
      title: 'Cumplimiento acumulado',
      render: (value, record) => (
        <CustomProgress
          percent={
            Number(record.ACTUAL_VALUE) > 0
              ? Math.round(Math.min(value || 0, 100))
              : 0
          }
          showInfo
        />
      ),
    },
  ]

  const header = (
    <CustomSpace direction={'horizontal'} width={'max-content'}>
      <CustomButton
        type={'primary'}
        icon={<FlagOutlined />}
        onClick={toggleModalState}
      >
        Asignar Metas
      </CustomButton>
      <CustomButton
        type={'primary'}
        icon={<LineChartOutlined />}
        onClick={toggleProgressModal}
      >
        Registrar Progreso
      </CustomButton>
    </CustomSpace>
  )

  const columnsMap: ColumnsMap = {
    TARGET_DATE: {
      header: 'Fecha',
      render: (value: string) => dayFormat(value),
    },
    DESCRIPTION: 'Meta',
    TARGET_VALUE: {
      header: 'Meta diaria',
      render: (value) => formatter({ value, format: 'currency' }),
    },
    ACTUAL_VALUE: {
      header: 'Real Acumulado',
      render: (value) => formatter({ value, format: 'currency' }),
    },
    ACTUAL_VALUE_ACC: {
      header: 'Objetivo Acumulado',
      render: (value, record) =>
        Number(record.ACTUAL_VALUE) > 0
          ? formatter({ value, format: 'currency' })
          : 0,
    },
    COMPLIANCE: {
      header: '% Diario acumulado',
      render: (value, record) =>
        Number(record.ACTUAL_VALUE) > 0
          ? Math.round(Math.min(Number(value) || 0, 100))
          : 0,
    },
  }

  return (
    <>
      <CustomSpin spinning={isGetSummaryPending}>
        <CustomSpace direction="vertical" size={24} style={{ width: '100%' }}>
          <CustomCard>
            <CustomCollapse
              items={[
                {
                  key: '1',
                  children: <WeeklyQualityChart height={250} />,
                  label: (
                    <CustomText strong>
                      Progreso general del módulo para la semana{' '}
                      {
                        periodOptions.find((item) => item.value === period)
                          ?.label
                      }
                    </CustomText>
                  ),
                },
              ]}
            />
          </CustomCard>

          <SmartTable
            header={header}
            columns={columns}
            columnsMap={columnsMap}
            dataSource={moduleSummary}
            exportable
            showStates={false}
            filter={filter}
            form={form}
            initialFilter={initialFilter}
            loading={isSummaryFetching}
            metadata={tableMetadata}
            onChange={handleSearch}
            onSearch={setSearchKey}
            rowKey={'key'}
            searchPlaceholder={'Buscar metas o fechas...'}
            showActions={false}
            exportInitialValues={{ extraHeaderHtml }}
          />
        </CustomSpace>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <AssignGoal open={modalState} onCancel={toggleModalState} />
      </ConditionalComponent>
      <ConditionalComponent condition={progressModalState}>
        <ProgressForm
          open={progressModalState}
          onCancel={toggleProgressModal}
        />
      </ConditionalComponent>
    </>
  )
}

export default Goals
