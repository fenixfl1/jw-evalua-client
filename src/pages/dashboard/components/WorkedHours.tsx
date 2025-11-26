import React, { useMemo } from 'react'
import { Empty } from 'antd'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styled from 'styled-components'
import CustomCard from 'src/components/custom/CustomCard'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import ConditionalComponent from 'src/components/ConditionalComponent'
import {
  WorkedHoursModule,
  WorkedHoursStaff,
} from 'src/services/dashboard/useGetWorkedHoursQuery'

type WorkedHoursProps = {
  modules: WorkedHoursModule[]
  staff: WorkedHoursStaff[]
}

const TooltipBox = styled.div`
  background: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  padding: 10px 12px;
  border-radius: 8px;
`

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`

const formatHours = (value: number) => `${value.toFixed(2)} h`

const WorkedHours: React.FC<WorkedHoursProps> = ({ modules, staff }) => {
  const topModules = useMemo(() => modules.slice(0, 8), [modules])
  const topStaff = useMemo(() => staff.slice(0, 8), [staff])

  return (
    <CustomCard>
      <CustomDivider>
        <CustomTitle level={5}>Horas trabajadas</CustomTitle>
      </CustomDivider>
      <CustomSpace direction="vertical" size="large" style={{ width: '100%' }}>
        <section>
          <CustomText strong>Módulos</CustomText>
          <ConditionalComponent
            condition={topModules.length > 0}
            fallback={<Empty description="Sin datos de tiempo" />}
          >
            <ChartContainer>
              <ResponsiveContainer>
                <BarChart
                  data={topModules}
                  margin={{ left: 0, right: 12, top: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="moduleName"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    height={60}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => `${value}h`} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload as WorkedHoursModule
                      return (
                        <TooltipBox>
                          <CustomText strong>{label}</CustomText>
                          <TooltipRow>
                            <span>Horas</span>
                            <span>{formatHours(item.hoursWorked)}</span>
                          </TooltipRow>
                          <TooltipRow>
                            <span>Operarios</span>
                            <span>{item.staffCount}</span>
                          </TooltipRow>
                          <TooltipRow>
                            <span>Sesiones activas</span>
                            <span>{item.activeSessions}</span>
                          </TooltipRow>
                        </TooltipBox>
                      )
                    }}
                  />
                  <Bar
                    dataKey="hoursWorked"
                    fill="#3f51b5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ConditionalComponent>
        </section>

        <section>
          <CustomText strong>Operarios</CustomText>
          <ConditionalComponent
            condition={topStaff.length > 0}
            fallback={<Empty description="Sin datos de tiempo" />}
          >
            <StaffGrid>
              {topStaff.map((item) => (
                <StaffCard key={item.staffId}>
                  <div>
                    <CustomText strong>{item.staffName}</CustomText>
                    <br />
                    <CustomText type="secondary">{item.moduleName}</CustomText>
                  </div>
                  <div>
                    <CustomText>{formatHours(item.hoursWorked)}</CustomText>
                    <br />
                    <CustomText type="secondary">
                      Sesiones activas: {item.activeSessions}
                    </CustomText>
                  </div>
                </StaffCard>
              ))}
            </StaffGrid>
          </ConditionalComponent>
        </section>
      </CustomSpace>
    </CustomCard>
  )
}

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
`

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`

const StaffCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  background: ${({ theme }) => (theme?.isDark ? '#1f1f1f' : '#fff')};
  box-shadow: ${({ theme }) =>
    theme?.isDark
      ? '0 4px 12px rgba(0,0,0,0.24)'
      : '0 4px 12px rgba(0,0,0,0.08)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export default WorkedHours
