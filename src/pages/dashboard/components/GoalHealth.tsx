import { Empty } from 'antd'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import React, { useMemo } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle, CustomText } from 'src/components/custom/CustomParagraph'
import CustomProgress from 'src/components/custom/CustomProgress'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpace from 'src/components/custom/CustomSpace'
import { DashboardSummaryResponse } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'
import styled from 'styled-components'

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const formatHours = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  return `${Number(value).toFixed(1)} h`
}

const GOAL_GAUGE_COLORS = ['#52c41a', '#d9d9d9']

const DonutCenter = styled.div`
  position: absolute;
  text-align: center;
  pointer-events: none;
`

const GoalHealthContainer = styled.div`
  max-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const DonutWrapper = styled.div`
  position: relative;
  height: 280px;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
`

interface GoalHealthProps {
  summary: DashboardSummaryResponse
  dataSource?: {
    name: string
    value: number
  }[]
}

const GoalHealth: React.FC<GoalHealthProps> = ({
  dataSource = [],
  summary,
}) => {
  const totals = summary.goalProductivity.totals

  const gaugeData = useMemo(
    () =>
      dataSource && dataSource.length
        ? dataSource
        : [
            { name: 'Completadas', value: totals.completedGoals },
            {
              name: 'Pendientes',
              value: Math.max(0, totals.totalGoals - totals.completedGoals),
            },
          ],
    [dataSource, totals.completedGoals, totals.totalGoals]
  )

  const completionRateLabel =
    totals.completionRate !== null
      ? formatter({
          value: totals.completionRate,
          format: 'percentage',
          fix: 1,
        })
      : 'N/D'

  const moduleRanking = useMemo(
    () =>
      summary.goalComplianceByModule
        .map((item) => ({
          module: item.moduleName || 'Sin modulo',
          completionRate: item.completionRate ?? 0,
          goalsCompleted: item.goalsCompleted,
          goalsAssigned: item.goalsAssigned,
          timeEfficiency: item.timeEfficiency,
        }))
        .sort((a, b) => (b.completionRate ?? 0) - (a.completionRate ?? 0))
        .slice(0, 5),
    [summary.goalComplianceByModule]
  )

  const hasGoalData = totals.totalGoals > 0 || moduleRanking.length > 0

  return (
    <>
      <CustomDivider>
        <CustomTitle level={5}>Salud de metas</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={hasGoalData}
        fallback={<Empty description="Sin metas registradas" />}
      >
        <GoalHealthContainer>
          <CustomRow gutter={[16, 16]} align="middle" style={{ height: '100%' }}>
            <CustomCol xs={24} md={12}>
              <DonutWrapper>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="70%"
                      outerRadius="90%"
                      startAngle={90}
                      endAngle={450}
                      paddingAngle={2}
                    >
                      {gaugeData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={GOAL_GAUGE_COLORS[index] || '#d9d9d9'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter>
                  <CustomTitle level={3}>{completionRateLabel}</CustomTitle>
                  <CustomText type="secondary">
                    {formatNumber(totals.completedGoals)} /{' '}
                    {formatNumber(totals.totalGoals)} metas
                  </CustomText>
                  <CustomText type="secondary">
                    Tiempo real prom. {formatHours(totals.averageActualTime)}
                  </CustomText>
                </DonutCenter>
              </DonutWrapper>
            </CustomCol>
            <CustomCol xs={24} md={12}>
              <LegendList>
                {moduleRanking.map((item) => (
                  <CustomSpace
                    key={item.module}
                    direction="vertical"
                    size={1}
                    style={{ width: '100%' }}
                  >
                    <CustomSpace direction="horizontal" align="center" wrap>
                      <CustomText strong>{item.module}</CustomText>
                      <CustomText type="secondary">
                        {formatter({
                          value: item.completionRate ?? 0,
                          format: 'percentage',
                          fix: 1,
                        })}
                      </CustomText>
                    </CustomSpace>
                    <CustomText type="secondary">
                      Metas {formatNumber(item.goalsCompleted)} /{' '}
                      {formatNumber(item.goalsAssigned)}
                    </CustomText>
                    <CustomText type="secondary">
                      Tiempo vs objetivo{' '}
                      {item.timeEfficiency !== null
                        ? formatter({
                            value: item.timeEfficiency,
                            format: 'percentage',
                            fix: 1,
                          })
                        : 'N/D'}
                    </CustomText>
                    <CustomProgress
                      percent={Math.min(item.completionRate ?? 0, 150)}
                      showInfo={false}
                    />
                  </CustomSpace>
                ))}
              </LegendList>
            </CustomCol>
          </CustomRow>
        </GoalHealthContainer>
      </ConditionalComponent>
    </>
  )
}

export default GoalHealth
