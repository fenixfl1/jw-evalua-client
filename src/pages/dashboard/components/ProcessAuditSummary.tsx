import React, { useMemo } from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { Empty } from 'antd'
import { useGetProcessAuditsQuery } from 'src/services/production/useGetProcessAuditsQuery'

interface ProcessAuditSummaryProps {
  moduleId?: number
}

const ProcessAuditSummary: React.FC<ProcessAuditSummaryProps> = ({
  moduleId,
}) => {
  const { data, isFetching } = useGetProcessAuditsQuery(moduleId)

  const summary = useMemo(() => {
    if (!data?.length) {
      return {
        total: 0,
        defects: 0,
      }
    }

    const defects = data.reduce((acc, audit) => {
      return (
        acc +
        audit.ENTRIES.reduce(
          (entryAcc, entry) =>
            entryAcc +
            (entry.defects?.reduce(
              (defectAcc: number, defect: any) =>
                defectAcc + Number(defect.count ?? 0),
              0
            ) ?? 0),
          0
        )
      )
    }, 0)

    return {
      total: data.length,
      defects,
    }
  }, [data])

  return (
    <CustomCard title="Auditorías recientes" loading={isFetching}>
      {data?.length ? (
        <CustomSpace direction="vertical" size={12} style={{ width: '100%' }}>
          <CustomText>
            Auditorías registradas: <strong>{summary.total}</strong>
          </CustomText>
          <CustomText type="secondary">
            Defectos totales detectados: {summary.defects}
          </CustomText>
          <CustomText strong>Últimos reportes</CustomText>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.slice(0, 4).map((audit) => (
              <li key={audit.PROCESS_AUDIT_ID}>
                {new Date(audit.AUDIT_DATE).toLocaleDateString('es-DO')} ·{' '}
                {audit.SHIFT || 'Turno no especificado'} ·{' '}
                {audit.ENTRIES.length} operaciones
              </li>
            ))}
          </ul>
        </CustomSpace>
      ) : (
        <Empty description="Sin auditorías registradas" />
      )}
    </CustomCard>
  )
}

export default ProcessAuditSummary
