import { Empty } from 'antd'
import React, { useMemo } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomTag from 'src/components/custom/CustomTag'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import { EmployeeProductivityEntry } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'

interface TopPerformersProps {
  dataSource: EmployeeProductivityEntry[]
}

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

const TopPerformers: React.FC<TopPerformersProps> = ({ dataSource = [] }) => {
  const topEmployees = useMemo(
    () =>
      dataSource
        .slice()
        .sort((a, b) => {
          const rateA = a.completionRate ?? -Infinity
          const rateB = b.completionRate ?? -Infinity
          if (rateA === rateB) {
            return b.completedGoals - a.completedGoals
          }
          return rateB - rateA
        })
        .slice(0, 5),
    [dataSource]
  )

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Destacados por eficiencia</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!topEmployees.length}
        fallback={<Empty description="Sin colaboradores destacados" />}
      >
        <CustomSpace direction="vertical" size={16} style={{ width: '100%' }}>
          {topEmployees.map((employee, index) => (
            <CustomSpace
              key={`${employee.staffId ?? index}-${employee.staffName}`}
              direction="horizontal"
              size={12}
              align="start"
            >
              <CustomTag color="blue">#{index + 1}</CustomTag>
              <CustomSpace direction="vertical" size={2}>
                <CustomText>{employee.staffName}</CustomText>
                <CustomText type="secondary">
                  Cumplimiento {formatPercentage(employee.completionRate)} •
                  Metas {formatNumber(employee.completedGoals)}/
                  {formatNumber(employee.assignedGoals)}
                </CustomText>
                <CustomText type="secondary">
                  Eficiencia {formatPercentage(employee.efficiency)} • Tiempo
                  real prom. {formatHours(employee.averageActualTime)}
                </CustomText>
              </CustomSpace>
            </CustomSpace>
          ))}
        </CustomSpace>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default TopPerformers
