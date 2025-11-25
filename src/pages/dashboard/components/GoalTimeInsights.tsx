/* eslint-disable @typescript-eslint/no-explicit-any */
import { Empty } from 'antd'
import React, { useMemo } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from 'recharts'
import styled from 'styled-components'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpace from 'src/components/custom/CustomSpace'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import {
  GoalProductivityTotals,
  GoalTimeInsights as GoalTimeInsightsData,
} from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'

interface GoalTimeInsightsProps {
  insights: GoalTimeInsightsData
  totals: GoalProductivityTotals
}

const STATUS_CONFIG = [
  {
    key: 'completedAhead',
    label: 'Completadas adelantadas',
    color: '#13c2c2',
  },
  {
    key: 'completedOnTime',
    label: 'Completadas a tiempo',
    color: '#52c41a',
  },
  {
    key: 'completedLate',
    label: 'Completadas con retraso',
    color: '#fa8c16',
  },
  {
    key: 'inProgress',
    label: 'En progreso',
    color: '#1890ff',
  },
  {
    key: 'notStarted',
    label: 'Pendientes',
    color: '#bfbfbf',
  },
] as const satisfies ReadonlyArray<{
  key: keyof GoalTimeInsightsData
  label: string
  color: string
}>

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const formatHours = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  return `${Number(value).toFixed(1)} h`
}

const getPercentageLabel = (numerator: number, denominator: number): string => {
  if (denominator <= 0 || Number.isNaN(denominator)) {
    return '0.0%'
  }

  return formatter({
    value: (numerator / denominator) * 100,
    format: 'percentage',
    fix: 1,
  })
}

const ChartContainer = styled.div`
  width: 100%;
  height: 220px;
  position: relative;
`

const ChartCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const LegendLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`

const LegendValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  line-height: 1.2;
`

const ColorDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
`

const TooltipContainer = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  padding: 8px 12px;
  max-width: 240px;
  font-size: 12px;
`

const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`

const TooltipValues = styled.div`
  display: flex;
  justify-content: space-between;
`

type StatusConfig = (typeof STATUS_CONFIG)[number]

type StatusData = StatusConfig & {
  value: number
  percentage: number
}

const StatusTooltip: React.FC<
  TooltipProps<string, string> & { payload?: any }
> = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload as StatusData

  return (
    <TooltipContainer>
      <TooltipTitle>{data.label}</TooltipTitle>
      <TooltipValues>
        <span>{formatNumber(data.value)}</span>
        <span>{(data.percentage * 100).toFixed(1)}%</span>
      </TooltipValues>
    </TooltipContainer>
  )
}

const GoalTimeInsights: React.FC<GoalTimeInsightsProps> = ({
  insights,
  totals,
}) => {
  const { statusData, referenceTotal } = useMemo(() => {
    const rawData = STATUS_CONFIG.map((status) => ({
      ...status,
      value: Number(insights[status.key] ?? 0),
    }))

    const sumFromInsights = rawData.reduce((acc, item) => acc + item.value, 0)

    const reference =
      totals.totalGoals > 0 ? totals.totalGoals : sumFromInsights

    const normalizedData: StatusData[] = rawData.map((item) => ({
      ...item,
      percentage: reference > 0 ? item.value / reference : 0,
    }))

    return {
      statusData: normalizedData,
      referenceTotal: reference,
    }
  }, [insights, totals.totalGoals])

  const hasData =
    referenceTotal > 0 ||
    statusData.some((item) => item.value > 0) ||
    totals.completedGoals > 0

  const completionRateLabel =
    totals.completionRate !== null && !Number.isNaN(totals.completionRate)
      ? formatter({
          value: totals.completionRate,
          format: 'percentage',
          fix: 1,
        })
      : 'N/D'

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Estado de metas</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={hasData}
        fallback={<Empty description="Sin metas registradas" />}
      >
        <CustomRow gutter={[16, 16]}>
          <CustomCol xs={24} md={13}>
            <ChartContainer>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {statusData.map((item) => (
                      <Cell key={item.key} fill={item.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<StatusTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ChartCenter>
                <CustomTitle level={4}>{completionRateLabel}</CustomTitle>
                <CustomText type="secondary">Cumplimiento</CustomText>
                <CustomText type="secondary">
                  {formatNumber(totals.completedGoals)} /{' '}
                  {formatNumber(referenceTotal)} metas
                </CustomText>
              </ChartCenter>
            </ChartContainer>
          </CustomCol>
          <CustomCol xs={24} md={11}>
            <CustomSpace
              direction="vertical"
              size={16}
              style={{ width: '100%' }}
            >
              <LegendList>
                {statusData.map((item) => (
                  <LegendItem key={item.key}>
                    <LegendLabel>
                      <ColorDot style={{ background: item.color }} />
                      {item.label}
                    </LegendLabel>
                    <LegendValue>
                      <span>{formatNumber(item.value)}</span>
                      <span>
                        {getPercentageLabel(item.value, referenceTotal)}
                      </span>
                    </LegendValue>
                  </LegendItem>
                ))}
              </LegendList>
              {/* <CustomSpace direction="vertical" size={4}>
                <CustomText strong>Tiempos promedio</CustomText>
                <CustomText type="secondary">
                  Real: {formatHours(insights.averageActualTime)} | Objetivo:{' '}
                  {formatHours(insights.averageTargetTime)} | Variación:{' '}
                  {formatHours(insights.averageTimeVariance)}
                </CustomText>
              </CustomSpace> */}
            </CustomSpace>
          </CustomCol>
        </CustomRow>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default GoalTimeInsights
