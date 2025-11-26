import React, { useMemo } from 'react'
import styled from 'styled-components'

import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomSpace from 'src/components/custom/CustomSpace'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import { DashboardDailySummary } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'

const HighlightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`

const HighlightCard = styled.div`
  padding: 18px 22px;
  border-radius: 16px;
  background: ${({ theme }) => (theme?.isDark ? '#161f34' : '#ffffff')};
  border: 1px solid
    ${({ theme }) => (theme?.isDark ? 'rgba(255,255,255,0.08)' : '#edf1f7')};
  box-shadow: ${({ theme }) =>
    theme?.isDark
      ? '0 10px 20px rgba(0,0,0,0.3)'
      : '0 12px 28px rgba(9,30,66,0.05)'};
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const HighlightLabel = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) =>
    theme?.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'};
`

const HighlightValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => (theme?.isDark ? '#ffffff' : 'rgba(0,0,0,0.88)')};
`

const HighlightComplement = styled.span`
  font-size: 14px;
  color: ${({ theme }) =>
    theme?.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'};
`

const HighlightHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) =>
    theme?.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
`

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`

const DetailCard = styled.div`
  padding: 14px 18px;
  border-radius: 14px;
  background: ${({ theme }) => (theme?.isDark ? '#111a2e' : '#f7f9fc')};
  border: 1px solid
    ${({ theme }) => (theme?.isDark ? 'rgba(255,255,255,0.08)' : '#edf1f7')};
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const DetailLabel = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) =>
    theme?.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'};
`

const DetailValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => (theme?.isDark ? '#ffffff' : 'rgba(0,0,0,0.88)')};
`

const DetailHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) =>
    theme?.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
`

const formatNumber = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0'
  }
  return Number(value).toLocaleString('es-DO')
}

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

interface DailySummaryProps {
  summary: DashboardDailySummary
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary }) => {
  const dateLabel = useMemo(() => {
    if (!summary?.date) {
      return ''
    }
    const date = new Date(summary.date)
    if (Number.isNaN(date.valueOf())) {
      return ''
    }
    return new Intl.DateTimeFormat('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }, [summary?.date])

  const completionLabel =
    summary.completionRate !== null && !Number.isNaN(summary.completionRate)
      ? formatter({
          value: summary.completionRate,
          format: 'percentage',
          fix: 1,
        })
      : 'N/D'

  const primaryMetrics = [
    {
      key: 'goals',
      label: 'Metas alcanzadas',
      value: formatNumber(summary.completedGoals),
      complement: `de ${formatNumber(summary.activeGoals)} metas`,
      hint:
        summary.activeGoals > 0
          ? completionLabel !== 'N/D'
            ? `Cumplimiento ${completionLabel}`
            : 'Sin datos de cumplimiento'
          : 'Sin metas programadas',
    },
    {
      key: 'progress',
      label: 'Avance acumulado',
      value: formatNumber(summary.actualValue),
      complement: `de ${formatNumber(summary.targetValue)} planificadas`,
      hint:
        summary.targetValue > 0
          ? 'Valor real vs planificado'
          : 'Sin valor diario',
    },
    {
      key: 'time',
      label: 'Tiempo invertido',
      value: formatHours(summary.actualTime),
      complement: `de ${formatHours(summary.targetTime)}`,
      hint: 'Horas reales vs objetivo',
    },
  ]

  const secondaryMetrics = [
    {
      key: 'variance',
      label: 'Variación de tiempo',
      value: formatSignedHours(summary.timeVariance),
      hint: 'Horas respecto al plan',
    },
    {
      key: 'activity',
      label: 'Actividades registradas',
      value: formatNumber(summary.activityCount),
      hint: 'Movimientos en el día',
    },
  ]

  const hasData =
    summary.activeGoals > 0 ||
    summary.targetValue > 0 ||
    summary.actualValue > 0 ||
    summary.actualTime > 0 ||
    summary.evaluationsCompleted > 0 ||
    summary.activityCount > 0

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Resumen del día</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={hasData}
        fallback={
          <CustomText type="secondary">
            Sin información registrada para la fecha.
          </CustomText>
        }
      >
        <CustomSpace direction="vertical" size={16} style={{ width: '100%' }}>
          {dateLabel ? (
            <CustomText
              type="secondary"
              style={{ textTransform: 'capitalize' }}
            >
              {dateLabel}
            </CustomText>
          ) : null}
          <HighlightsGrid>
            {primaryMetrics.map((metric) => (
              <HighlightCard key={metric.key}>
                <HighlightLabel>{metric.label}</HighlightLabel>
                <HighlightValue>{metric.value}</HighlightValue>
                <HighlightComplement>{metric.complement}</HighlightComplement>
                <HighlightHint>{metric.hint}</HighlightHint>
              </HighlightCard>
            ))}
          </HighlightsGrid>
          <DetailsGrid>
            {secondaryMetrics.map((metric) => (
              <DetailCard key={metric.key}>
                <DetailLabel>{metric.label}</DetailLabel>
                <DetailValue>{metric.value}</DetailValue>
                <DetailHint>{metric.hint}</DetailHint>
              </DetailCard>
            ))}
          </DetailsGrid>
        </CustomSpace>
      </ConditionalComponent>
    </CustomCol>
  )
}

export default DailySummary
