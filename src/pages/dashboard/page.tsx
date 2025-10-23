import React, { useEffect, useMemo, useState } from 'react'
import { ClearOutlined, ReloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import CustomCard from 'src/components/custom/CustomCard'
import CustomRow from 'src/components/custom/CustomRow'
import CustomCol from 'src/components/custom/CustomCol'
import CustomSpace from 'src/components/custom/CustomSpace'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomButton from 'src/components/custom/CustomButton'
import CustomSpin from 'src/components/custom/CustomSpin'

import { useGetDashboardSummaryQuery } from 'src/services/dashboard/useGetDashboardSummaryQuery'
import { useGetDashboardActivityMutation } from 'src/services/dashboard/useGetDashboardActivityMutation'
import {
  DashboardSummaryFilters,
  DashboardSummaryResponse,
  DashboardActivityFilters,
  DashboardActivityResponse,
} from 'src/services/dashboard/dashboard.types'
import useDebounce from 'src/hooks/use-debounce'
import ActivityHistory from './components/ActivityHistory'
import KpiCards from './components/KpiCards'
import GoalHealth from './components/GoalHealth'
import GoalCompletionTrend from './components/GoalCompletionTrend'
import GoalTimeInsights from './components/GoalTimeInsights'
import ModuleProductivity from './components/ModuleProductivity'
import EmployeeProductivity from './components/EmployeeProductivity'
import TopPerformers from './components/TopPerformers'
import DailySummary from './components/DailySummary'

const SectionCard = styled(CustomCard)`
  height: 100%;
`

const ACTIVITY_LIMIT = 15

const summaryFallback: DashboardSummaryResponse = {
  kpis: {
    totalStaff: 0,
    activeModules: 0,
    newStaffLast30Days: 0,
    evaluationsCompleted: 0,
    evaluationsPending: 0,
    evaluationsAverageScore: null,
    activeGoals: 0,
    goalComplianceAverage: null,
  },
  evaluationsTrend: [],
  evaluationsByModule: [],
  goalComplianceByModule: [],
  staffDistribution: [],
  recentEvaluations: [],
  filters: {
    modules: [],
    periods: [],
  },
  goalProductivity: {
    totals: {
      totalGoals: 0,
      completedGoals: 0,
      completionRate: null,
      averageTargetTime: null,
      averageActualTime: null,
      averageTimeVariance: null,
      totalTargetValue: 0,
      totalActualValue: 0,
      totalTargetTime: 0,
      totalActualTime: 0,
    },
    byModule: [],
    byPeriod: [],
    timeInsights: {
      completedOnTime: 0,
      completedLate: 0,
      completedAhead: 0,
      inProgress: 0,
      notStarted: 0,
      averageTimeVariance: null,
      averageTargetTime: null,
      averageActualTime: null,
    },
    employees: [],
  },
  moduleTopPerformers: [],
  dailySummary: {
    date: new Date(0).toISOString(),
    targetValue: 0,
    actualValue: 0,
    completionRate: null,
    targetTime: null,
    actualTime: null,
    timeVariance: null,
    activeGoals: 0,
    completedGoals: 0,
    evaluationsCompleted: 0,
    activityCount: 0,
  },
}

const activityFallback: DashboardActivityResponse = {
  items: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: ACTIVITY_LIMIT,
      links: undefined,
    },
  },
}

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardSummaryFilters>({})
  const [activityFilters, setActivityFilters] =
    useState<DashboardActivityFilters>({
      limit: ACTIVITY_LIMIT,
      offset: 0,
    })
  const [modelSearch, setModelSearch] = useState('')

  const debouncedModelSearch = useDebounce(modelSearch, 400)

  const {
    data: summaryData,
    isFetching: isFetchingSummary,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery(filters)

  const {
    data: activityData,
    mutateAsync: fetchActivity,
    isPending: isFetchingActivity,
  } = useGetDashboardActivityMutation()

  useEffect(() => {
    setActivityFilters((prev) => ({
      ...prev,
      model: debouncedModelSearch || undefined,
      offset: 0,
    }))
  }, [debouncedModelSearch])

  useEffect(() => {
    fetchActivity(activityFilters)
  }, [activityFilters, fetchActivity])

  const summary = summaryData ?? summaryFallback
  const activity = activityData ?? activityFallback
  const goalProductivity = summary.goalProductivity
  const goalProductivityTotals = goalProductivity.totals
  const goalTimeInsights = goalProductivity.timeInsights
  const dailySummary = summary.dailySummary ?? summaryFallback.dailySummary

  const moduleOptions = useMemo(
    () =>
      summary.filters.modules.map((item) => ({
        label: item.description,
        value: item.moduleId,
      })),
    [summary.filters.modules]
  )

  const periodOptions = useMemo(
    () =>
      summary.filters.periods.map((period) => ({
        label: formatPeriodLabel(period),
        value: period,
      })),
    [summary.filters.periods]
  )

  const goalCompletionTrend = useMemo(
    () =>
      goalProductivity.byPeriod.map((item) => ({
        label: item.periodLabel || 'Sin periodo',
        completedGoals: item.completedGoals,
        completionRate: Number(item.completionRate ?? 0),
        totalGoals: item.totalGoals,
        averageActualTime: item.averageActualTime ?? 0,
        averageTargetTime: item.averageTargetTime ?? 0,
      })),
    [goalProductivity.byPeriod]
  )

  const moduleProductivityData = useMemo(
    () =>
      goalProductivity.byModule.map((item, index) => ({
        key: `${item.moduleId ?? index}-${item.moduleName}`,
        module: item.moduleName || 'Sin modulo',
        totalGoals: item.totalGoals,
        completedGoals: item.completedGoals,
        completionRate: Number(item.completionRate ?? 0),
        goalsOnTime: item.goalsOnTime,
        goalsLate: item.goalsLate,
        goalsInProgress: item.goalsInProgress,
        goalsPending: item.goalsPending,
        timeEfficiency: item.timeEfficiency ?? null,
        averageActualTime: item.averageActualTime ?? null,
        averageTargetTime: item.averageTargetTime ?? null,
        averageTimeVariance: item.averageTimeVariance ?? null,
      })),
    [goalProductivity.byModule]
  )

  const goalCompletionGauge = useMemo(() => {
    const completed = goalProductivityTotals.completedGoals ?? 0
    const total = goalProductivityTotals.totalGoals ?? 0
    const pending = Math.max(0, total - completed)

    return [
      { name: 'Completadas', value: completed },
      { name: 'Pendientes', value: pending },
    ]
  }, [goalProductivityTotals.completedGoals, goalProductivityTotals.totalGoals])

  const employeeProductivityData = useMemo(
    () =>
      goalProductivity.employees.map((item, index) => ({
        key: `${item.staffId ?? index}-${item.staffName}`,
        ...item,
      })),
    [goalProductivity.employees]
  )

  const employeeHighlights = useMemo(
    () => goalProductivity.employees.slice(0, 5),
    [goalProductivity.employees]
  )

  const handleModuleChange = (value: number | null) => {
    setFilters((prev) => ({
      ...prev,
      moduleId: value ?? undefined,
    }))
  }

  const handlePeriodChange = (
    value: number | null,
    key: 'periodStart' | 'periodEnd'
  ) => {
    setFilters((prev) => {
      const updated: DashboardSummaryFilters = {
        ...prev,
        [key]: value ?? undefined,
      }

      if (
        updated.periodStart !== undefined &&
        updated.periodEnd !== undefined &&
        updated.periodStart > updated.periodEnd
      ) {
        if (key === 'periodStart') {
          updated.periodEnd = updated.periodStart
        } else {
          updated.periodStart = updated.periodEnd
        }
      }

      return updated
    })
  }

  const handleResetSummaryFilters = () => {
    setFilters({})
  }

  const handleRefreshSummary = () => {
    refetchSummary()
    fetchActivity(activityFilters)
  }

  return (
    <CustomSpin spinning={isFetchingSummary}>
      <CustomSpace direction="vertical" size={24} style={{ width: '100%' }}>
        <CustomRow justify={'space-between'} align={'middle'}>
          <CustomCol>
            <CustomTitle level={3}>Panel de productividad</CustomTitle>
            <CustomText type="secondary">
              Sigue el desempeno, las metas cumplidas y los tiempos de respuesta
              por modulo.
            </CustomText>
          </CustomCol>
          <CustomCol>
            <CustomButton
              icon={<ReloadOutlined />}
              type="primary"
              ghost
              onClick={handleRefreshSummary}
            >
              Actualizar datos
            </CustomButton>
          </CustomCol>
        </CustomRow>

        <CustomCard>
          <CustomRow justify={'space-between'} gutter={[16, 16]} width={'100%'}>
            <CustomRow
              justify={'start'}
              align="middle"
              gutter={[16, 16]}
              width={'90%'}
            >
              <CustomCol xs={24} md={8} lg={6}>
                <CustomSelect
                  width={'100%'}
                  allowClear
                  placeholder="Filtrar por módulo"
                  options={moduleOptions}
                  value={filters.moduleId ?? undefined}
                  onChange={(value) =>
                    handleModuleChange(value as number | null)
                  }
                />
              </CustomCol>
              <CustomCol xs={24} md={8} lg={6}>
                <CustomSelect
                  width={'100%'}
                  allowClear
                  placeholder="Periodo inicial"
                  options={periodOptions}
                  value={filters.periodStart ?? undefined}
                  onChange={(value) =>
                    handlePeriodChange(value as number | null, 'periodStart')
                  }
                />
              </CustomCol>
              <CustomCol xs={24} md={8} lg={6}>
                <CustomSelect
                  width={'100%'}
                  allowClear
                  placeholder="Periodo final"
                  options={periodOptions}
                  value={filters.periodEnd ?? undefined}
                  onChange={(value) =>
                    handlePeriodChange(value as number | null, 'periodEnd')
                  }
                />
              </CustomCol>
            </CustomRow>
            <CustomButton
              icon={<ClearOutlined />}
              onClick={handleResetSummaryFilters}
            >
              Limpiar filtros
            </CustomButton>
          </CustomRow>
        </CustomCard>

        <CustomRow gutter={[16, 16]} align="stretch">
          <KpiCards summary={summary} />
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24}>
            <DailySummary summary={dailySummary} />
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24} xl={14}>
            <SectionCard>
              <GoalTimeInsights
                insights={goalTimeInsights}
                totals={goalProductivityTotals}
              />
            </SectionCard>
          </CustomCol>
          <CustomCol xs={24} xl={10}>
            <SectionCard>
              <GoalCompletionTrend
                dataSource={goalCompletionTrend}
                totals={goalProductivityTotals}
              />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24}>
            <SectionCard>
              <GoalHealth dataSource={goalCompletionGauge} summary={summary} />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24}>
            <SectionCard>
              <ModuleProductivity dataSource={moduleProductivityData} />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24}>
            <SectionCard>
              <EmployeeProductivity dataSource={employeeProductivityData} />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24} lg={16}>
            <SectionCard>
              <TopPerformers dataSource={employeeHighlights} />
            </SectionCard>
          </CustomCol>
          <CustomCol xs={24} lg={8}>
            <SectionCard>
              <ActivityHistory
                onOpenSearch={setModelSearch}
                openSearch={modelSearch}
                dataSource={activity}
                metadata={activity.metadata.pagination}
                loading={isFetchingActivity}
              />
            </SectionCard>
          </CustomCol>
        </CustomRow>
      </CustomSpace>
    </CustomSpin>
  )
}

function formatPeriodLabel(period: number): string {
  const text = String(period)
  if (text.length < 6) return text
  const year = text.slice(0, 4)
  const week = text.slice(4)
  return `${year}-S${week}`
}

export default Dashboard
