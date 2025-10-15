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

const GOAL_GAUGE_COLORS = ['#52c41a', '#d9d9d9']

const DonutCenter = styled.div`
  position: absolute;
  text-align: center;
  pointer-events: none;
`

const DonutWrapper = styled.div`
  position: relative;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

interface GoalHealthProps {
  summary: DashboardSummaryResponse
  dataSource?: {
    name: string
    value: number
  }[]
}

const GoalHealth: React.FC<GoalHealthProps> = ({ dataSource, summary }) => {
  const goalCompliance = useMemo(
    () => summary.goalComplianceByModule,
    [summary.goalComplianceByModule]
  )

  const goalComplianceRanking = useMemo(
    () =>
      goalCompliance
        .map((item) => ({
          module: item.moduleName || 'Sin módulo',
          compliance: item.compliance ?? 0,
          target: Number(item.targetValue ?? 0),
          actual: Number(item.actualValue ?? 0),
        }))
        .sort((a, b) => (b.compliance ?? 0) - (a.compliance ?? 0))
        .slice(0, 5),
    [goalCompliance]
  )

  const goalComplianceAverageValue = useMemo(
    () =>
      Math.max(
        0,
        Math.min(100, Number(summary.kpis.goalComplianceAverage ?? 0))
      ),
    [summary.kpis.goalComplianceAverage]
  )

  const goalComplianceAverageLabel =
    summary.kpis.goalComplianceAverage !== null
      ? formatter({
          value: summary.kpis.goalComplianceAverage,
          format: 'percentage',
          fix: 1,
        })
      : 'N/D'
  return (
    <>
      <CustomDivider>
        <CustomTitle level={5}>Salud de metas</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={
          summary.kpis.activeGoals > 0 || goalComplianceRanking.length > 0
        }
        fallback={<Empty description="Sin metas registradas" />}
      >
        <CustomRow gutter={[16, 16]} align="middle">
          <CustomCol xs={24} md={12}>
            <DonutWrapper>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dataSource}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={2}
                  >
                    {dataSource.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={GOAL_GAUGE_COLORS[index] || '#d9d9d9'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <DonutCenter>
                <CustomTitle level={3}>
                  {goalComplianceAverageValue.toFixed(1)}%
                </CustomTitle>
                <CustomText type="secondary">
                  {goalComplianceAverageLabel}
                </CustomText>
                <CustomText type="secondary">
                  {formatNumber(summary.kpis.activeGoals)} metas activas
                </CustomText>
              </DonutCenter>
            </DonutWrapper>
          </CustomCol>
          <CustomCol xs={24} md={12}>
            <LegendList>
              {goalComplianceRanking.map((item) => (
                <CustomSpace
                  key={item.module}
                  direction="vertical"
                  size={0}
                  style={{ width: '100%' }}
                >
                  <CustomSpace direction="horizontal" align="center">
                    <CustomText strong>{item.module}</CustomText>
                    <CustomText type="secondary">
                      {formatter({
                        value: item.compliance ?? 0,
                        format: 'percentage',
                        fix: 1,
                      })}
                    </CustomText>
                  </CustomSpace>
                  <CustomProgress
                    percent={Math.min(item.compliance ?? 0, 100)}
                    showInfo={false}
                  />
                </CustomSpace>
              ))}
            </LegendList>
          </CustomCol>
        </CustomRow>
      </ConditionalComponent>
    </>
  )
}

export default GoalHealth
