import { Empty } from 'antd'
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { ResponsiveContainer, Pie, Cell, PieChart, Sector } from 'recharts'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle, CustomText } from 'src/components/custom/CustomParagraph'
import styled from 'styled-components'

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

const PIE_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#13c2c2',
  '#722ed1',
]

const DonutCenter = styled.div`
  position: absolute;
  text-align: center;
  pointer-events: none;
`

const DonutWrapper = styled.div`
  position: relative;
  height: 300px;
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  .recharts-responsive-container,
  .recharts-wrapper,
  .recharts-surface {
    overflow: visible !important;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
`

const LegendList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
  width: 100%;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

interface ActiveShapeProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: {
    name: string
    value: number
  }
  percent: number
  value: number
}

const renderActiveShape = ({
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
}: ActiveShapeProps) => {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'
  const participation = `${(percent * 100).toFixed(1)}%`

  return (
    <g>
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
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#666"
      >
        {`Colaboradores: ${formatNumber(value)}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={36}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`Participación: ${participation}`}
      </text>
    </g>
  )
}

interface StaffDistributionProps {
  dataSource: {
    name: string
    value: number
  }[]
}

const StaffDistribution: React.FC<StaffDistributionProps> = ({
  dataSource = [],
}) => {
  const [, setActiveIndex] = useState(0)
  const totalStaffCount = useMemo(
    () => dataSource.reduce((acc, item) => acc + item.value, 0),
    [dataSource]
  )

  const legendItems = useMemo(
    () => [...dataSource].sort((a, b) => b.value - a.value),
    [dataSource]
  )

  const colorMap = useMemo(() => {
    const map = new Map<string, string>()
    dataSource.forEach((entry, index) => {
      map.set(entry.name, PIE_COLORS[index % PIE_COLORS.length])
    })
    return map
  }, [dataSource])

  const handlePieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    if (!dataSource.length) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((prev) =>
      prev < dataSource.length ? prev : Math.max(dataSource.length - 1, 0)
    )
  }, [dataSource])

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Distribución de personal</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!dataSource.length}
        fallback={<Empty description="Sin información de personal" />}
      >
        <ContentWrapper>
          <DonutWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, bottom: 8 }}>
                <Pie
                  data={dataSource}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  activeShape={renderActiveShape}
                  onMouseEnter={handlePieEnter}
                >
                  {dataSource.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter>
              <CustomTitle level={3}>
                {formatNumber(totalStaffCount)}
              </CustomTitle>
              <CustomText type="secondary">Colaboradores</CustomText>
            </DonutCenter>
          </DonutWrapper>
          <LegendList>
            {legendItems.map((item) => {
              const percent =
                totalStaffCount > 0
                  ? ((item.value / totalStaffCount) * 100).toFixed(1)
                  : '0.0'
              const color = colorMap.get(item.name) ?? PIE_COLORS[0]
              return (
                <LegendItem key={item.name}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: color,
                      display: 'inline-block',
                    }}
                  />
                  <CustomText>{item.name}</CustomText>
                  <CustomText type="secondary">
                    {`${formatNumber(item.value)} (${percent}%)`}
                  </CustomText>
                </LegendItem>
              )
            })}
          </LegendList>
        </ContentWrapper>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default StaffDistribution
