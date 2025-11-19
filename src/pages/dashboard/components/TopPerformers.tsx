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

const formatNumber = (value?: number | null): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? value.toLocaleString('es-DO')
    : '0'

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

const formatUnits = (value?: number | null): string => formatNumber(value)

const TopPerformers: React.FC<TopPerformersProps> = ({ dataSource = [] }) => {
  const topEmployees = useMemo(
    () =>
      dataSource
        .slice()
        .sort((a, b) => {
          const effA = a.efficiency ?? -Infinity
          const effB = b.efficiency ?? -Infinity
          if (effA === effB) {
            return (b.totalActualValue ?? 0) - (a.totalActualValue ?? 0)
          }
          return effB - effA
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
                  Unidades {formatUnits(employee.totalActualValue)}/
                  {formatUnits(employee.totalTargetValue)} • Tiempo real{' '}
                  {formatHours(employee.totalActualTime)} vs plan{' '}
                  {formatHours(employee.totalTargetTime)}
                </CustomText>
                <CustomText type="secondary">
                  Eficiencia {formatPercentage(employee.efficiency)} •
                  Cumplimiento {formatPercentage(employee.completionRate)}
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
