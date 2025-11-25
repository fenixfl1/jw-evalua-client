/* eslint-disable @typescript-eslint/no-explicit-any */
import { Empty } from 'antd'
import React, { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import styled from 'styled-components'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import formatter from 'src/utils/formatter'

interface ModuleProductivityRow {
  key: string
  module: string
  totalGoals: number
  completedGoals: number
  completionRate: number | null
  goalsOnTime: number
  goalsLate: number
  goalsInProgress: number
  goalsPending: number
  timeEfficiency: number | null
  averageActualTime: number | null
  averageTargetTime: number | null
  averageTimeVariance: number | null
}

interface ModuleProductivityProps {
  dataSource: ModuleProductivityRow[]
}

const ChartContainer = styled.div`
  width: 100%;
  height: 320px;
`

const TooltipContainer = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  max-width: 280px;
`

const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 13px;
`

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
`

const TooltipLabel = styled.span`
  color: #8c8c8c;
`

const TooltipValue = styled.span`
  font-weight: 500;
`

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const formatPercentage = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  return formatter({ value, format: 'percentage', fix: 1 })
}

const formatHours = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  return `${Number(value).toFixed(1)} h`
}

const formatSignedHours = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  const hours = Number(value)
  const sign = hours > 0 ? '+' : ''
  return `${sign}${hours.toFixed(1)} h`
}

const normalizeNumber = (value?: number | null): number =>
  typeof value === 'number' && !Number.isNaN(value) ? value : 0

const GOAL_STATUS_COLORS = {
  goalsOnTime: '#52c41a',
  goalsLate: '#fa8c16',
  goalsInProgress: '#1890ff',
  goalsPending: '#bfbfbf',
}

const LINE_COLORS = {
  completionRate: '#722ed1',
  timeEfficiency: '#13c2c2',
}

const STACK_KEYS = [
  'goalsOnTime',
  'goalsLate',
  'goalsInProgress',
  'goalsPending',
] as const

const TOP_BAR_RADIUS: [number, number, number, number] = [6, 6, 0, 0]
const NO_BAR_RADIUS: [number, number, number, number] = [0, 0, 0, 0]

const CustomTooltip: React.FC<
  TooltipProps<string, string> & { payload?: any; label?: any }
> = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload as {
    totalGoals: number
    completedGoals: number
    completionRate?: number | null
    timeEfficiency?: number | null
    averageActualTime?: number | null
    averageTargetTime?: number | null
    averageTimeVariance?: number | null
  }

  return (
    <TooltipContainer>
      <TooltipTitle>{label}</TooltipTitle>
      <TooltipRow>
        <TooltipLabel>Metas asignadas</TooltipLabel>
        <TooltipValue>{formatNumber(data.totalGoals)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Metas completadas</TooltipLabel>
        <TooltipValue>{formatNumber(data.completedGoals)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Cumplimiento</TooltipLabel>
        <TooltipValue>{formatPercentage(data.completionRate)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Eficiencia tiempo</TooltipLabel>
        <TooltipValue>{formatPercentage(data.timeEfficiency)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Tiempo real prom.</TooltipLabel>
        <TooltipValue>{formatHours(data.averageActualTime)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Tiempo objetivo prom.</TooltipLabel>
        <TooltipValue>{formatHours(data.averageTargetTime)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Desviacion prom.</TooltipLabel>
        <TooltipValue>
          {formatSignedHours(data.averageTimeVariance)}
        </TooltipValue>
      </TooltipRow>
    </TooltipContainer>
  )
}

const ModuleProductivity: React.FC<ModuleProductivityProps> = ({
  dataSource = [],
}) => {
  const chartData = useMemo(
    () =>
      dataSource.map((entry) => {
        const normalized = {
          goalsOnTime: normalizeNumber(entry.goalsOnTime),
          goalsLate: normalizeNumber(entry.goalsLate),
          goalsInProgress: normalizeNumber(entry.goalsInProgress),
          goalsPending: normalizeNumber(entry.goalsPending),
          totalGoals: normalizeNumber(entry.totalGoals),
          completedGoals: normalizeNumber(entry.completedGoals),
        }

        let topStackSegment: (typeof STACK_KEYS)[number] | null = null
        STACK_KEYS.forEach((key) => {
          if (normalized[key] > 0) {
            topStackSegment = key
          }
        })

        return {
          module: entry.module || 'Sin modulo',
          ...normalized,
          completionRate: entry.completionRate,
          timeEfficiency: entry.timeEfficiency,
          averageActualTime: entry.averageActualTime,
          averageTargetTime: entry.averageTargetTime,
          averageTimeVariance: entry.averageTimeVariance,
          completionRatePct:
            entry.completionRate === null || Number.isNaN(entry.completionRate)
              ? null
              : entry.completionRate,
          timeEfficiencyPct:
            entry.timeEfficiency === null || Number.isNaN(entry.timeEfficiency)
              ? null
              : entry.timeEfficiency,
          topStackSegment,
        }
      }),
    [dataSource]
  )

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Productividad por modulo</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!dataSource.length}
        fallback={<Empty description="Sin datos de productividad" />}
      >
        <ChartContainer>
          <ResponsiveContainer>
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value.toFixed(0)}%`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="goalsOnTime"
                name="A tiempo"
                stackId="goals"
                fill={GOAL_STATUS_COLORS.goalsOnTime}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`${entry.module}-goalsOnTime`}
                    radius={
                      (entry.topStackSegment === 'goalsOnTime' &&
                      entry.goalsOnTime > 0
                        ? TOP_BAR_RADIUS
                        : NO_BAR_RADIUS) as never
                    }
                  />
                ))}
              </Bar>
              <Bar
                yAxisId="left"
                dataKey="goalsLate"
                name="Con retraso"
                stackId="goals"
                fill={GOAL_STATUS_COLORS.goalsLate}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`${entry.module}-goalsLate`}
                    radius={
                      (entry.topStackSegment === 'goalsLate' &&
                      entry.goalsLate > 0
                        ? TOP_BAR_RADIUS
                        : NO_BAR_RADIUS) as never
                    }
                  />
                ))}
              </Bar>
              <Bar
                yAxisId="left"
                dataKey="goalsInProgress"
                name="En progreso"
                stackId="goals"
                fill={GOAL_STATUS_COLORS.goalsInProgress}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`${entry.module}-goalsInProgress`}
                    radius={
                      (entry.topStackSegment === 'goalsInProgress' &&
                      entry.goalsInProgress > 0
                        ? TOP_BAR_RADIUS
                        : NO_BAR_RADIUS) as never
                    }
                  />
                ))}
              </Bar>
              <Bar
                yAxisId="left"
                dataKey="goalsPending"
                name="Pendientes"
                stackId="goals"
                fill={GOAL_STATUS_COLORS.goalsPending}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`${entry.module}-goalsPending`}
                    radius={
                      (entry.topStackSegment === 'goalsPending' &&
                      entry.goalsPending > 0
                        ? TOP_BAR_RADIUS
                        : NO_BAR_RADIUS) as never
                    }
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="completionRatePct"
                name="Cumplimiento"
                yAxisId="right"
                stroke={LINE_COLORS.completionRate}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="timeEfficiencyPct"
                name="Eficiencia tiempo"
                yAxisId="right"
                stroke={LINE_COLORS.timeEfficiency}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default ModuleProductivity
