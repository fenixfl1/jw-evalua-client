import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import React, { useMemo } from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { DashboardSummaryResponse } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'
import styled from 'styled-components'

const KPIWrapper = styled.div`
  height: 100%;
  .kpi-content {
    display: flex;
    gap: 12px;
    align-items: center;
  }
`

const KpiIcon = styled.div<{ $bg: string; $color: string }>`
  width: 48px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 24px;
`

const formatNumber = (value: number): string => value.toLocaleString('es-DO')

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
  const sign = hours > 0 ? '+' : hours < 0 ? '' : ''
  return `${sign}${hours.toFixed(1)} h`
}

interface InfoCardsProps {
  summary?: DashboardSummaryResponse
}

const KpiCards: React.FC<InfoCardsProps> = ({
  summary = {} as DashboardSummaryResponse,
}) => {
  const totals = summary?.goalProductivity?.totals
  const averageScore = summary?.kpis?.evaluationsAverageScore ?? null

  const kpiCards = useMemo(() => {
    const safeTotals = totals ?? {
      totalGoals: 0,
      completedGoals: 0,
      completionRate: null,
      averageTargetTime: null,
      averageActualTime: null,
      averageTimeVariance: null,
      totalTargetValue: 0,
      totalActualValue: 0,
      totalTargetTime: 0,
      totalActualTime: 0,
    }

    const completionRateLabel =
      safeTotals.completionRate !== null
        ? formatter({
            value: safeTotals.completionRate,
            format: 'percentage',
            fix: 1,
          })
        : 'N/D'

    const evaluationAverage = formatter({
      value: averageScore ?? 0,
      format: 'percentage',
      fix: 1,
    })

    return [
      {
        key: 'completedGoals',
        title: 'Metas completadas',
        value: formatNumber(safeTotals.completedGoals),
        icon: <CheckCircleOutlined />,
        colors: { bg: '#f6ffed', color: '#389e0d' },
        extra: `Total metas ${formatNumber(safeTotals.totalGoals)}`,
      },
      {
        key: 'completionRate',
        title: 'Tasa de cumplimiento',
        value: completionRateLabel,
        icon: <RiseOutlined />,
        colors: { bg: '#e6f7ff', color: '#096dd9' },
        extra: `Score promedio ${evaluationAverage}`,
      },
      {
        key: 'actualTime',
        title: 'Tiempo real promedio',
        value: formatHours(safeTotals.averageActualTime),
        icon: <ClockCircleOutlined />,
        colors: { bg: '#fff7e6', color: '#d48806' },
        extra: `Estimado ${formatHours(safeTotals.averageTargetTime)}`,
      },
      {
        key: 'timeVariance',
        title: 'Desviacion de tiempo',
        value: formatSignedHours(safeTotals.averageTimeVariance),
        icon: <DashboardOutlined />,
        colors: { bg: '#fff1f0', color: '#cf1322' },
        extra: `Horas reales totales ${formatHours(
          safeTotals.totalActualTime
        )}`,
      },
    ]
  }, [totals, averageScore])

  return (
    <>
      <CustomCol xs={24}>
        <CustomCard>
          <CustomSpace
            direction={'horizontal'}
            size={30}
            split={<CustomDivider type={'vertical'} />}
          >
            {kpiCards.map((kpi) => (
              <KPIWrapper key={kpi.key}>
                <div className="kpi-content">
                  <KpiIcon $bg={kpi.colors.bg} $color={kpi.colors.color}>
                    {kpi.icon}
                  </KpiIcon>
                  <CustomSpace size={2} direction="vertical">
                    <CustomText type="secondary">
                      {kpi.title}: <strong>{kpi.value}</strong>
                    </CustomText>
                    <CustomText type="secondary">{kpi.extra ?? ''}</CustomText>
                  </CustomSpace>
                </div>
              </KPIWrapper>
            ))}
          </CustomSpace>
        </CustomCard>
      </CustomCol>
    </>
  )
}

export default KpiCards
