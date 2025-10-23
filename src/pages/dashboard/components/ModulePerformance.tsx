import { Empty } from 'antd'
import React from 'react'
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
  BarChart,
  Tooltip as RechartsTooltip,
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

interface ModulePerformanceProps {
  dataSource: {
    module: string
    completed: number
    pending: number
    averageScore: number
  }[]
}

const ModulePerformance: React.FC<ModulePerformanceProps> = ({
  dataSource = [],
}) => {
  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Rendimiento por módulo</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!dataSource.length}
        fallback={<Empty description="Sin evaluaciones por módulo" />}
      >
        <ChartContainer style={{ height: 340 }}>
          <ResponsiveContainer>
            <BarChart
              data={dataSource}
              layout="vertical"
              margin={{ left: 0, right: 32, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="module" width={130} />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  name,
                ]}
              />
              <Legend />
              <Bar
                dataKey="completed"
                name="Completadas"
                fill={EVALUATION_BAR_COLORS.completed}
                stackId="modules"
              />
              <Bar
                dataKey="pending"
                name="Pendientes"
                fill={EVALUATION_BAR_COLORS.pending}
                stackId="modules"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default ModulePerformance
