import {
  TeamOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  AimOutlined,
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

interface InfoCardsProps {
  summary?: DashboardSummaryResponse
}

const KpiCards: React.FC<InfoCardsProps> = ({ summary }) => {
  const kpiCards = useMemo(() => {
    const averageScore =
      summary.kpis.evaluationsAverageScore !== null
        ? formatter({
            value: summary.kpis.evaluationsAverageScore,
            format: 'percentage',
            fix: 1,
          })
        : 'N/D'

    const goalComplianceAverage =
      summary.kpis.goalComplianceAverage !== null
        ? formatter({
            value: summary.kpis.goalComplianceAverage,
            format: 'percentage',
            fix: 1,
          })
        : 'N/D'

    return [
      {
        key: 'talent',
        title: 'Talento activo',
        value: formatNumber(summary.kpis.totalStaff),
        icon: <TeamOutlined />,
        colors: { bg: '#e6f7ff', color: '#1890ff' },
        extra: `+${formatNumber(summary.kpis.newStaffLast30Days)} en 30 días`,
      },
      {
        key: 'modules',
        title: 'Módulos activos',
        value: formatNumber(summary.kpis.activeModules),
        icon: <AppstoreOutlined />,
        colors: { bg: '#fff7e6', color: '#faad14' },
        extra: `Promedio score ${averageScore}`,
      },
      {
        key: 'evaluations',
        title: 'Evaluaciones completadas',
        value: formatNumber(summary.kpis.evaluationsCompleted),
        icon: <CheckCircleOutlined />,
        colors: { bg: '#f0f5ff', color: '#2f54eb' },
        extra: `${formatNumber(summary.kpis.evaluationsPending)} pendientes`,
      },
      {
        key: 'goals',
        title: 'Metas activas',
        value: formatNumber(summary.kpis.activeGoals),
        icon: <AimOutlined />,
        colors: { bg: '#e6fffb', color: '#13c2c2' },
        extra: `Cumplimiento prom. ${goalComplianceAverage}`,
      },
    ]
  }, [summary.kpis])

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
              <KPIWrapper>
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
