/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Card } from 'antd'
import {
  BarChart,
  Bar,
  Tooltip,
  YAxis,
  PieChart,
  Legend,
  Pie,
  Sector,
} from 'recharts'
import CustomCard from 'src/components/custom/CustomCard'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import styled from 'styled-components'
import CustomSpace from 'src/components/custom/CustomSpace'
import formatter from 'src/utils/formatter'

const PieCard = styled(CustomCard)`
  .recharts-default-legend {
    width: max-content !important;
  }
`

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`PV ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

const kpis = [
  {
    title: 'Evaluados este mes',
    value: 58,
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  },
  {
    title: 'Evaluaciones pendientes',
    value: 12,
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
  },
  {
    title: 'Promedio desempeño',
    value: '84%',
    icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
  },
  {
    title: 'Alertas activas',
    value: 3,
    icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
  },
]

const TooltipContent = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: #f0f4f6;
  opacity: 90%;
  height: 100px;
  padding: 10px;
`

const { Meta } = Card

const Dashboard: React.FC = () => {
  const barData = [
    {
      fill: '#1890ff',
      uv: 40,
      pv: 4,
      percentage: 12,
      area: 'Capacitación',
    },
    {
      fill: '#ffc53d',
      uv: 25,
      pv: 2,
      percentage: 8,
      area: 'Motivación',
    },
    {
      fill: '#ff4d4f',
      uv: 15,
      pv: 5,
      percentage: 18,
      area: 'Puntualidad',
    },
    {
      fill: '#73d13d',
      uv: 20,
      pv: 7,
      percentage: 14,
      area: 'Otros',
    },
  ]

  const pieData: {
    name: string
    value: number
    fill: string
  }[] = [
    {
      name: 'Capacitación',
      value: 40,
      fill: '#1890ff',
    },
    {
      name: 'Motivación',
      value: 250,
      fill: '#ffc53d',
    },
    {
      name: 'Puntualidad',
      value: 40,
      fill: '#ff4d4f',
    },
    {
      name: 'Otros',
      value: 250,
      fill: '#73d13d',
    },
  ]

  return (
    <CustomRow gap={16}>
      <CustomCol xs={24}>
        <CustomRow gutter={[16, 16]}>
          {kpis.map((kpi, index) => (
            <CustomCol key={index} xs={24} sm={12} md={6}>
              <CustomCard>
                <Meta
                  avatar={kpi.icon}
                  title={kpi.title}
                  description={
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {kpi.value}
                    </span>
                  }
                />
              </CustomCard>
            </CustomCol>
          ))}
        </CustomRow>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomRow gutter={[16, 16]} align={'top'}>
          <CustomCol xs={24} md={12}>
            <CustomCard style={{ minHeight: '485px' }}>
              <CustomDivider>
                <CustomTitle level={5}>Desempeño por área</CustomTitle>
              </CustomDivider>

              <BarChart width={260} height={250} data={barData}>
                <YAxis />
                <Tooltip
                  content={({ label }) => {
                    const item = barData?.[label as never]
                    return (
                      <TooltipContent>
                        <CustomSpace>
                          <CustomText style={{ color: item?.fill }}>
                            {item?.area}
                          </CustomText>
                          <CustomText style={{ color: item?.fill }}>
                            {formatter({
                              value: item?.uv,
                              format: 'currency',
                              prefix: 'RD',
                              fix: 2,
                            })}
                          </CustomText>
                          <CustomText style={{ color: item?.fill }}>
                            {formatter({
                              value: item?.percentage,
                              format: 'percentage',
                              fix: 2,
                            })}
                          </CustomText>
                        </CustomSpace>
                      </TooltipContent>
                    )
                  }}
                />
                <Bar dataKey="uv" radius={[8, 8, 0, 0]} />
              </BarChart>
            </CustomCard>
          </CustomCol>
          <CustomCol xs={24} md={12}>
            <PieCard>
              <CustomCol xs={24} style={{ height: '460px' }}>
                <CustomRow justify={'center'}>
                  <CustomDivider>
                    <CustomTitle level={5}>
                      Empleados por departamentos
                    </CustomTitle>
                  </CustomDivider>
                  <PieChart width={500} height={300}>
                    <Legend />
                    <Pie
                      // activeIndex={this.state.activeIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                  </PieChart>
                </CustomRow>
              </CustomCol>
            </PieCard>
          </CustomCol>
        </CustomRow>
      </CustomCol>
    </CustomRow>
  )
}

export default Dashboard
