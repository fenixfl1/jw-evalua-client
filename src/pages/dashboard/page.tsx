import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  AimOutlined,
  AppstoreOutlined,
  UserAddOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import dayjs, { Dayjs } from 'dayjs'
import styled from 'styled-components'

import CustomCard from 'src/components/custom/CustomCard'
import CustomRow from 'src/components/custom/CustomRow'
import CustomCol from 'src/components/custom/CustomCol'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomButton from 'src/components/custom/CustomButton'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import CustomTimeline from 'src/components/custom/CustomTimeline'

import { useGetDashboardSummaryQuery } from 'src/services/dashboard/useGetDashboardSummaryQuery'
import { useGetDashboardActivityMutation } from 'src/services/dashboard/useGetDashboardActivityMutation'
import {
  DashboardSummaryFilters,
  DashboardSummaryResponse,
  DashboardActivityFilters,
  DashboardActivityResponse,
} from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'
import useDebounce from 'src/hooks/use-debounce'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomPopover from 'src/components/custom/CustomPopover'
import CustomList from 'src/components/custom/CustomList'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import CustomListItem from 'src/components/custom/CustomListItem'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { Empty } from 'antd'

const KPIWrapper = styled(CustomCard)`
  height: 100%;
  .kpi-content {
    display: flex;
    gap: 12px;
    align-items: center;
  }
`

const HistoryContainer = styled.div`
  max-height: 22rem;
  overflow-y: auto;
  padding: 10px;
`

const KpiIcon = styled.div<{ $bg: string; $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 24px;
`

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
`

const ACTIVITY_LIMIT = 15

const ACTIVITY_ACTION_META: Record<string, { label: string; color: string }> = {
  INSERT: { label: 'Creación', color: 'green' },
  UPDATE: { label: 'Actualización', color: 'blue' },
}

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

const PIE_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#13c2c2',
  '#722ed1',
]

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/D'

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardSummaryFilters>({})
  const [activityFilters, setActivityFilters] =
    useState<DashboardActivityFilters>({
      limit: ACTIVITY_LIMIT,
      offset: 0,
    })
  const [modelSearch, setModelSearch] = useState('')
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)

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
    fetchActivity(activityFilters).then((resp) => {
      // eslint-disable-next-line no-console
      console.log({ resp })
    })
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

  const kpiCards = useMemo(
    () => [
      {
        key: 'staff',
        title: 'Colaboradores activos',
        value: formatNumber(summary.kpis.totalStaff),
        icon: <TeamOutlined />,
        colors: { bg: '#e6f7ff', color: '#1890ff' },
      },
      {
        key: 'newStaff',
        title: 'Nuevos (30 días)',
        value: formatNumber(summary.kpis.newStaffLast30Days),
        icon: <UserAddOutlined />,
        colors: { bg: '#f6ffed', color: '#52c41a' },
      },
      {
        key: 'modules',
        title: 'Módulos activos',
        value: formatNumber(summary.kpis.activeModules),
        icon: <AppstoreOutlined />,
        colors: { bg: '#fff7e6', color: '#faad14' },
      },
      {
        key: 'completed',
        title: 'Evaluaciones completadas',
        value: formatNumber(summary.kpis.evaluationsCompleted),
        icon: <CheckCircleOutlined />,
        colors: { bg: '#f0f5ff', color: '#2f54eb' },
      },
      {
        key: 'average',
        title: 'Promedio general',
        value:
          summary.kpis.evaluationsAverageScore !== null
            ? formatter({
                value: summary.kpis.evaluationsAverageScore,
                format: 'percentage',
                fix: 1,
              })
            : 'N/D',
        icon: <ClockCircleOutlined />,
        colors: { bg: '#fff0f6', color: '#eb2f96' },
      },
      {
        key: 'goals',
        title: 'Cumplimiento metas prom.',
        value:
          summary.kpis.goalComplianceAverage !== null
            ? formatter({
                value: summary.kpis.goalComplianceAverage,
                format: 'percentage',
                fix: 1,
              })
            : 'N/D',
        icon: <AimOutlined />,
        colors: { bg: '#e6fffb', color: '#13c2c2' },
      },
    ],
    [summary.kpis]
  )

  const trendData = useMemo(
    () => summary.evaluationsTrend,
    [summary.evaluationsTrend]
  )
  const evaluationsByModule = useMemo(
    () => summary.evaluationsByModule,
    [summary.evaluationsByModule]
  )
  const goalCompliance = useMemo(
    () => summary.goalComplianceByModule,
    [summary.goalComplianceByModule]
  )
  const staffDistribution = useMemo(
    () => summary.staffDistribution,
    [summary.staffDistribution]
  )

  const activityPagination = activity.metadata.pagination
  const canLoadMore =
    activityPagination.totalPages > 0 &&
    activityPagination.currentPage < activityPagination.totalPages

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

  const handleActivityActionChange = (value: string | number | null) => {
    setActivityFilters((prev) => ({
      ...prev,
      action: value ? (value as DashboardActivityFilters['action']) : undefined,
      offset: 0,
    }))
  }

  const handleDateRangeChange = (
    values: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(values)
    setActivityFilters((prev) => ({
      ...prev,
      dateFrom: values?.[0]?.startOf('day').toISOString(),
      dateTo: values?.[1]?.endOf('day').toISOString(),
      offset: 0,
    }))
  }

  const handleLoadMoreActivity = () => {
    if (!canLoadMore) return
    setActivityFilters((prev) => ({
      ...prev,
      offset: (prev.offset ?? 0) + (prev.limit ?? ACTIVITY_LIMIT),
    }))
  }

  const handleResetActivityFilters = () => {
    setModelSearch('')
    setDateRange(null)
    setActivityFilters({
      limit: ACTIVITY_LIMIT,
      offset: 0,
    })
  }

  const getActivityMeta = useCallback(
    (action: string) =>
      ACTIVITY_ACTION_META[action] ?? { label: action, color: 'gray' },
    []
  )

  const renderActivityTag = useCallback(
    (action: string) => {
      const meta = getActivityMeta(action)
      return <CustomTag color={meta.color}>{meta.label}</CustomTag>
    },
    [getActivityMeta]
  )

  const activityTimelineItems = useMemo(
    () =>
      activity.items.map((item) => {
        const meta = getActivityMeta(item.action)

        return {
          color: meta.color,
          label: (
            <CustomText type="secondary">
              {formatDateTime(item.createdAt)}
            </CustomText>
          ),
          children: (
            <CustomSpace direction="vertical" size={2}>
              <CustomSpace direction="horizontal" size={8} align="center">
                {renderActivityTag(item.action)}
              </CustomSpace>
              <CustomText type="secondary">
                ID referencia: {String(item.objectId ?? 'N/A')}
              </CustomText>
              <CustomText type="secondary">
                Usuario: {item.username ?? 'N/A'}
              </CustomText>
              <CustomText type="secondary">
                Colaborador: {item.staffName ?? 'N/A'}
              </CustomText>
            </CustomSpace>
          ),
        }
      }),
    [activity.items, getActivityMeta, renderActivityTag]
  )

  return (
    <CustomSpin spinning={isFetchingSummary}>
      <CustomSpace direction="vertical" size={16} style={{ width: '100%' }}>
        <CustomCard>
          <CustomRow gutter={[16, 16]} align="middle">
            <CustomCol xs={24} sm={12} md={6}>
              <CustomSelect
                allowClear
                placeholder="Filtrar por modulo"
                options={moduleOptions}
                value={filters.moduleId ?? undefined}
                onChange={(value) => handleModuleChange(value as number | null)}
              />
            </CustomCol>
            <CustomCol xs={24} sm={12} md={6}>
              <CustomSelect
                allowClear
                placeholder="Periodo inicial"
                options={periodOptions}
                value={filters.periodStart ?? undefined}
                onChange={(value) =>
                  handlePeriodChange(value as number | null, 'periodStart')
                }
              />
            </CustomCol>
            <CustomCol xs={24} sm={12} md={6}>
              <CustomSelect
                allowClear
                placeholder="Periodo final"
                options={periodOptions}
                value={filters.periodEnd ?? undefined}
                onChange={(value) =>
                  handlePeriodChange(value as number | null, 'periodEnd')
                }
              />
            </CustomCol>
            <CustomCol xs={24} sm={12} md={6}>
              <CustomSpace direction="horizontal" size={8}>
                <CustomButton onClick={handleResetSummaryFilters}>
                  Limpiar filtros
                </CustomButton>
                <CustomButton
                  icon={<ReloadOutlined />}
                  type="primary"
                  ghost
                  onClick={handleRefreshSummary}
                >
                  Recargar
                </CustomButton>
              </CustomSpace>
            </CustomCol>
          </CustomRow>
        </CustomCard>

        <CustomRow gutter={[16, 16]} justify={'start'}>
          {kpiCards.map((kpi) => (
            <CustomCol
              key={kpi.key}
              xs={24}
              sm={12}
              md={8}
              xl={6}
              style={{ marginBottom: 16 }}
            >
              <KPIWrapper>
                <div className="kpi-content">
                  <KpiIcon $bg={kpi.colors.bg} $color={kpi.colors.color}>
                    {kpi.icon}
                  </KpiIcon>
                  <CustomSpace size={0} direction="vertical">
                    <CustomText type="secondary">{kpi.title}</CustomText>
                    <CustomTitle level={3}>{kpi.value}</CustomTitle>
                  </CustomSpace>
                </div>
              </KPIWrapper>
            </CustomCol>
          ))}
        </CustomRow>

        <CustomRow gutter={[16, 16]}>
          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>Tendencia de evaluaciones</CustomTitle>
              </CustomDivider>
              {trendData.length ? (
                <ChartContainer>
                  <ResponsiveContainer>
                    <LineChart data={trendData} margin={{ left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        name="Completadas"
                        stroke="#52c41a"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pending"
                        name="Pendientes"
                        stroke="#faad14"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <Empty description="Sin datos para mostrar" />
              )}
            </CustomCard>
          </CustomCol>

          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>Promedio por modulo</CustomTitle>
              </CustomDivider>
              {evaluationsByModule.length ? (
                <ChartContainer>
                  <ResponsiveContainer>
                    <BarChart data={evaluationsByModule}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="moduleName" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number, name) => {
                          if (name === 'averageScore') {
                            return [
                              formatter({
                                value,
                                format: 'percentage',
                                fix: 1,
                              }),
                              'Promedio',
                            ]
                          }
                          return [formatNumber(value), name]
                        }}
                      />
                      <Legend
                        formatter={(value) =>
                          value === 'averageScore' ? 'Promedio' : value
                        }
                      />
                      <Bar
                        dataKey="averageScore"
                        name="Promedio"
                        fill="#1890ff"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <Empty description="Sin datos para mostrar" />
              )}
            </CustomCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]}>
          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>
                  Cumplimiento de metas por modulo
                </CustomTitle>
              </CustomDivider>
              {goalCompliance.length ? (
                <ChartContainer>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={goalCompliance.map((item) => ({
                          name: item.moduleName,
                          value: item.compliance ?? 0,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {goalCompliance.map((_, index) => (
                          <Cell
                            key={`goal-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) =>
                          formatter({
                            value,
                            format: 'percentage',
                            fix: 1,
                          })
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <Empty description="Sin datos para mostrar" />
              )}
            </CustomCard>
          </CustomCol>

          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>
                  Distribución de colaboradores
                </CustomTitle>
              </CustomDivider>
              <ConditionalComponent
                condition={!!staffDistribution.length}
                fallback={<Empty description="Sin datos para mostrar" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <BarChart data={staffDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="moduleName" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatNumber(value),
                          'Colaboradores',
                        ]}
                      />
                      <Legend formatter={() => 'Colaboradores'} />
                      <Bar
                        dataKey="staffCount"
                        name="Colaboradores"
                        fill="#722ed1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ConditionalComponent>
            </CustomCard>
          </CustomCol>
        </CustomRow>

        <CustomRow gutter={[16, 16]} align={'top'}>
          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>Evaluaciones recientes</CustomTitle>
              </CustomDivider>
              <ConditionalComponent
                condition={!!summary.recentEvaluations.length}
                fallback={<Empty description="Sin evaluaciones registradas" />}
              >
                <CustomList
                  dataSource={summary.recentEvaluations}
                  renderItem={(item) => (
                    <CustomListItem
                      extra={
                        <CustomSpace
                          direction={'vertical'}
                          size={0}
                          align="end"
                          width={'max-content'}
                        >
                          <CustomText strong>
                            {item.overallScore !== null
                              ? formatter({
                                  value: item.overallScore,
                                  format: 'percentage',
                                  fix: 1,
                                })
                              : 'N/D'}
                          </CustomText>
                          <CustomText type="secondary">
                            {formatDateTime(item.updatedAt)}
                          </CustomText>
                        </CustomSpace>
                      }
                    >
                      <CustomListItemMeta
                        title={item.staffName}
                        description={
                          <CustomSpace direction="vertical" size={0}>
                            <CustomText type="secondary">
                              {item.moduleName}
                            </CustomText>
                          </CustomSpace>
                        }
                      />
                    </CustomListItem>
                  )}
                />
              </ConditionalComponent>
            </CustomCard>
          </CustomCol>

          <CustomCol xs={24} lg={12}>
            <CustomCard>
              <CustomDivider>
                <CustomTitle level={5}>Historial de actividades</CustomTitle>
              </CustomDivider>
              <CustomCol xs={24}>
                <CustomRow justify={'start'}>
                  <CustomPopover
                    trigger={'click'}
                    content={
                      <div style={{ width: '350px' }}>
                        <CustomForm layout={'vertical'}>
                          <CustomFormItem
                            label={'Acción'}
                            labelCol={{ span: 24 }}
                          >
                            <CustomSelect
                              allowClear
                              placeholder={'Acción'}
                              options={[
                                { label: 'Creación', value: 'INSERT' },
                                { label: 'Actualización', value: 'UPDATE' },
                              ]}
                              value={activityFilters.action}
                              onChange={(value) =>
                                handleActivityActionChange(
                                  value as string | null
                                )
                              }
                            />
                          </CustomFormItem>

                          <CustomFormItem
                            label={'Rango de Fecha'}
                            labelCol={{ span: 24 }}
                          >
                            <CustomRangePicker
                              width={'100%'}
                              value={dateRange ?? undefined}
                              onChange={(values) =>
                                handleDateRangeChange(
                                  values as [Dayjs | null, Dayjs | null] | null
                                )
                              }
                            />
                          </CustomFormItem>

                          <CustomRow justify={'space-between'}>
                            <CustomButton
                              icon={<ClearOutlined />}
                              type={'link'}
                              onClick={handleResetActivityFilters}
                            >
                              Limpiar historial
                            </CustomButton>

                            <CustomButton
                              icon={<FilterOutlined />}
                              type={'primary'}
                            >
                              Aplicar Filtro
                            </CustomButton>
                          </CustomRow>
                        </CustomForm>
                      </div>
                    }
                  >
                    <CustomTooltip title={'Filtros'}>
                      <CustomButton
                        size={'large'}
                        icon={<FilterOutlined />}
                        type={'text'}
                      />
                    </CustomTooltip>
                  </CustomPopover>
                </CustomRow>
              </CustomCol>
              <HistoryContainer>
                <CustomSpin spinning={isFetchingActivity}>
                  <ConditionalComponent
                    condition={!!activity.items.length}
                    fallback={
                      <Empty description="Sin actividades registradas" />
                    }
                  >
                    <CustomTimeline mode="left" items={activityTimelineItems} />
                  </ConditionalComponent>

                  <ConditionalComponent condition={canLoadMore}>
                    <CustomSpace
                      direction="horizontal"
                      style={{
                        marginTop: 16,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <CustomButton
                        type={'link'}
                        icon={<ReloadOutlined />}
                        onClick={handleLoadMoreActivity}
                      >
                        Cargar mas
                      </CustomButton>
                    </CustomSpace>
                  </ConditionalComponent>
                </CustomSpin>
              </HistoryContainer>
            </CustomCard>
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
