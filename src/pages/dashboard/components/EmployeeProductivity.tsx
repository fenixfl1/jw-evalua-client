/* eslint-disable @typescript-eslint/no-explicit-any */
import { Empty } from 'antd'
import React, { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { EmployeeProductivityEntry } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'

interface EmployeeProductivityProps {
  dataSource: (EmployeeProductivityEntry & { key: string })[]
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

const TooltipDescription = styled.div`
  font-size: 12px;
  color: #595959;
  margin-bottom: 10px;
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

const normalizeNumber = (value?: number | null): number =>
  typeof value === 'number' && !Number.isNaN(value) ? value : 0

const GOAL_STATUS_COLORS = {
  completedOnTime: '#52c41a',
  completedLate: '#fa8c16',
  inProgressGoals: '#1890ff',
  pendingGoals: '#bfbfbf',
}

const CustomTooltip: React.FC<
  TooltipProps<string, string> & { payload?: any; label?: any }
> = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload as {
    modulesLabel: string
    assignedGoals: number
    completedGoals: number
    completionRate?: number | null
    efficiency?: number | null
    averageActualTime?: number | null
    averageTargetTime?: number | null
    averageTimeVariance?: number | null
  }

  return (
    <TooltipContainer>
      <TooltipTitle>{label}</TooltipTitle>
      <TooltipDescription>
        {data.modulesLabel || 'Sin modulo asignado'}
      </TooltipDescription>
      <TooltipRow>
        <TooltipLabel>Metas</TooltipLabel>
        <TooltipValue>
          {`${formatNumber(data.completedGoals)}/${formatNumber(
            data.assignedGoals
          )}`}
        </TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Cumplimiento</TooltipLabel>
        <TooltipValue>{formatPercentage(data.completionRate)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Eficiencia</TooltipLabel>
        <TooltipValue>{formatPercentage(data.efficiency)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Prom. tiempo real</TooltipLabel>
        <TooltipValue>{formatHours(data.averageActualTime)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Prom. tiempo objetivo</TooltipLabel>
        <TooltipValue>{formatHours(data.averageTargetTime)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Desviacion prom.</TooltipLabel>
        <TooltipValue>{formatHours(data.averageTimeVariance)}</TooltipValue>
      </TooltipRow>
    </TooltipContainer>
  )
}

const EmployeeProductivity: React.FC<EmployeeProductivityProps> = ({
  dataSource,
}) => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ dataSource })
  }, [dataSource])

  const chartData = useMemo(
    () =>
      dataSource.map((entry) => ({
        staffName: entry.staffName || 'Sin colaborador',
        completedOnTime: normalizeNumber(entry.completedOnTime),
        completedLate: normalizeNumber(entry.completedLate),
        inProgressGoals: normalizeNumber(entry.inProgressGoals),
        pendingGoals: normalizeNumber(entry.pendingGoals),
        assignedGoals: normalizeNumber(entry.assignedGoals),
        completedGoals: normalizeNumber(entry.completedGoals),
        completionRate: entry.completionRate,
        efficiency: entry.efficiency,
        averageActualTime: entry.averageActualTime,
        averageTargetTime: entry.averageTargetTime,
        averageTimeVariance: entry.averageTimeVariance,
        modulesLabel: entry.modules.length
          ? entry.modules.join(', ')
          : 'Sin modulo',
      })),
    [dataSource]
  )

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Productividad por colaborador</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!dataSource.length}
        fallback={<Empty description="Sin datos de colaboradores" />}
      >
        <ChartContainer>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="staffName" width={160} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="completedOnTime"
                name="A tiempo"
                fill={GOAL_STATUS_COLORS.completedOnTime}
                stackId="goals"
              />
              <Bar
                dataKey="completedLate"
                name="Con retraso"
                fill={GOAL_STATUS_COLORS.completedLate}
                stackId="goals"
              />
              <Bar
                dataKey="inProgressGoals"
                name="En progreso"
                fill={GOAL_STATUS_COLORS.inProgressGoals}
                stackId="goals"
              />
              <Bar
                dataKey="pendingGoals"
                name="Pendientes"
                fill={GOAL_STATUS_COLORS.pendingGoals}
                stackId="goals"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default EmployeeProductivity
