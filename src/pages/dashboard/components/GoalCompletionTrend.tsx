import { Empty } from 'antd'
import React, { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Line,
} from 'recharts'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { GoalProductivityTotals } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'
import styled from 'styled-components'

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
`

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const formatHours = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D'
  }
  return `${Number(value).toFixed(1)} h`
}

interface GoalCompletionTrendProps {
  dataSource: {
    label: string
    completionRate: number
    averageActualTime: number | null
    averageTargetTime: number | null
  }[]
  totals: GoalProductivityTotals
}

const GoalCompletionTrend: React.FC<GoalCompletionTrendProps> = ({
  dataSource = [],
  totals,
}) => {
  const chartData = useMemo(() => dataSource, [dataSource])

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Avance de metas por periodo</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!chartData.length}
        fallback={<Empty description="Sin datos de metas" />}
      >
        <>
          <ChartContainer>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="left" allowDecimals />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  hide
                />
                <RechartsTooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Cumplimiento') {
                      return [
                        formatter({ value, format: 'percentage', fix: 1 }),
                        name,
                      ]
                    }

                    return [formatHours(Number(value)), name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="averageTargetTime"
                  name="Tiempo objetivo"
                  fill="#ffc53d"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="averageActualTime"
                  name="Tiempo real"
                  fill="#1677ff"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completionRate"
                  name="Cumplimiento"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
          <CustomSpace direction="horizontal" size={24} wrap>
            <CustomText type="secondary">
              Metas totales: <strong>{formatNumber(totals.totalGoals)}</strong>
            </CustomText>
            <CustomText type="secondary">
              Completadas:{' '}
              <strong>{formatNumber(totals.completedGoals)}</strong>
            </CustomText>
          </CustomSpace>
        </>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default GoalCompletionTrend
