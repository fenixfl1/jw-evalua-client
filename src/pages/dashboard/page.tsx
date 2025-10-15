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
import PerformanceEvaluation from './components/PerformanceEvaluation'
import RecentReviews from './components/RecentReviews'
import StaffDistribution from './components/StaffDistribution'
import ModulePerformance from './components/ModulePerformance'

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

  const trendData = useMemo(
    () => summary.evaluationsTrend,
    [summary.evaluationsTrend]
  )
  const evaluationsByModule = useMemo(
    () => summary.evaluationsByModule,
    [summary.evaluationsByModule]
  )
  const staffDistribution = useMemo(
    () => summary.staffDistribution,
    [summary.staffDistribution]
  )

  const performanceTrend = useMemo(
    () =>
      trendData.map((item) => ({
        label: item.label,
        completed: item.completed,
        pending: item.pending,
        averageScore: item.averageScore ?? 0,
        total: item.total,
      })),
    [trendData]
  )

  const modulePerformanceData = useMemo(
    () =>
      evaluationsByModule
        .map((item) => ({
          module: item.moduleName || 'Sin módulo',
          completed: item.completed,
          pending: item.pending,
          averageScore: item.averageScore ?? 0,
        }))
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 6),
    [evaluationsByModule]
  )

  const goalComplianceAverageValue = useMemo(
    () =>
      Math.max(
        0,
        Math.min(100, Number(summary.kpis.goalComplianceAverage ?? 0))
      ),
    [summary.kpis.goalComplianceAverage]
  )

  const goalComplianceGauge = useMemo(
    () => [
      { name: 'Cumplidas', value: goalComplianceAverageValue },
      {
        name: 'Pendiente',
        value: Math.max(0, 100 - goalComplianceAverageValue),
      },
    ],
    [goalComplianceAverageValue]
  )

  const staffDistributionData = useMemo(
    () =>
      staffDistribution.map((item) => ({
        name: item.moduleName || 'Sin módulo',
        value: item.staffCount,
      })),
    [staffDistribution]
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
            <CustomTitle level={3}>Panel de control general</CustomTitle>
            <CustomText type="secondary">
              Visualiza el desempeño semanal de módulos, metas y evaluaciones.
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
          <CustomCol xs={24} xl={14}>
            <SectionCard>
              <PerformanceEvaluation dataSource={performanceTrend} />
            </SectionCard>
          </CustomCol>
          <CustomCol xs={24} xl={10}>
            <SectionCard>
              <GoalHealth dataSource={goalComplianceGauge} summary={summary} />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24} xl={10}>
            <SectionCard>
              <ModulePerformance dataSource={modulePerformanceData} />
            </SectionCard>
          </CustomCol>
          <CustomCol xs={24} xl={14}>
            <SectionCard>
              <StaffDistribution dataSource={staffDistributionData} />
            </SectionCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align="stretch">
          <CustomCol xs={24} lg={12}>
            <SectionCard>
              <RecentReviews summary={summary} />
            </SectionCard>
          </CustomCol>

          <CustomCol xs={24} lg={12}>
            <SectionCard>
              <ActivityHistory
                onOpenSearch={setModelSearch}
                openSearch={modelSearch}
                dataSource={activity}
                metadata={activityData.metadata.pagination}
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
