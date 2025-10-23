import { Empty } from 'antd'
import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  YAxis,
  Legend,
  Bar,
  Line,
} from 'recharts'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import styled from 'styled-components'

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const EVALUATION_BAR_COLORS = {
  completed: '#1890ff',
  pending: '#fa8c16',
  average: '#52c41a',
}

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
`

interface PerformanceEvaluationProps {
  dataSource: {
    label: string
    completed: number
    pending: number
    averageScore: number
    total: number
  }[]
}

const PerformanceEvaluation: React.FC<PerformanceEvaluationProps> = ({
  dataSource = [],
}) => {
  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Desempeño de evaluaciones</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!dataSource.length}
        fallback={<Empty description="Sin datos de evaluaciones" />}
      >
        <ChartContainer style={{ height: 340 }}>
          <ResponsiveContainer>
            <ComposedChart data={dataSource} margin={{ left: -10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                hide
              />
              <RechartsTooltip
                formatter={(value: number, name: string) =>
                  name === 'Promedio'
                    ? [`${Number(value).toFixed(1)}%`, name]
                    : [formatNumber(Number(value)), name]
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="completed"
                name="Completadas"
                stackId="total"
                fill={EVALUATION_BAR_COLORS.completed}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="pending"
                name="Pendientes"
                stackId="total"
                fill={EVALUATION_BAR_COLORS.pending}
                radius={[6, 6, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageScore"
                name="Promedio"
                stroke={EVALUATION_BAR_COLORS.average}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default PerformanceEvaluation
