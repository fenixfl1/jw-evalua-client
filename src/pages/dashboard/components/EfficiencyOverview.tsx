import React from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import CustomSpace from 'src/components/custom/CustomSpace'
import { CustomText } from 'src/components/custom/CustomParagraph'
import { useGetModuleEfficiencyQuery } from 'src/services/production/useGetModuleEfficiencyQuery'
import { Empty } from 'antd'

interface EfficiencyOverviewProps {
  moduleId?: number
  period?: number
}

const EfficiencyOverview: React.FC<EfficiencyOverviewProps> = ({
  moduleId,
  period,
}) => {
  const { data, isFetching } = useGetModuleEfficiencyQuery(moduleId, period)
  const latest = data?.[0]

  const history = data?.slice(0, 3) ?? []

  return (
    <CustomCard title="Eficiencia reciente" loading={isFetching}>
      {latest ? (
        <CustomSpace direction="vertical" size={12} style={{ width: '100%' }}>
          <CustomText>
            Periodo {latest.PERIOD}: <strong>{latest.EFFICIENCY_PERCENT}%</strong>
          </CustomText>
          <CustomText type="secondary">
            {latest.TOTAL_UNITS} prendas · SAM {latest.SAM} ·{' '}
            {latest.MINUTES_WORKED} min trabajados
          </CustomText>
          {latest.NOTES && (
            <CustomText type="secondary">Nota: {latest.NOTES}</CustomText>
          )}
          {history.length > 1 && (
            <>
              <CustomText strong>Historial</CustomText>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {history.slice(1).map((record) => (
                  <li key={record.MODULE_EFFICIENCY_ID}>
                    Periodo {record.PERIOD}: {record.EFFICIENCY_PERCENT}% ·{' '}
                    {record.TOTAL_UNITS} prendas
                  </li>
                ))}
              </ul>
            </>
          )}
        </CustomSpace>
      ) : (
        <Empty description="Sin registros de eficiencia" />
      )}
    </CustomCard>
  )
}

export default EfficiencyOverview
