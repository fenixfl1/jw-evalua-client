import React, { useMemo } from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { Empty } from 'antd'
import { useGetProcessAuditsQuery } from 'src/services/production/useGetProcessAuditsQuery'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomDivider from 'src/components/custom/CustomDivider'
import dayjs from 'dayjs'

interface ProcessAuditSummaryProps {
  moduleId?: number
}

const formatAuditDate = (value?: string) => {
  if (!value) return 'Fecha no disponible'
  const [dateOnly] = value.split('T')
  const parsed = dayjs(dateOnly)
  return parsed.isValid()
    ? parsed.format('DD MMM YYYY')
    : 'Fecha no disponible'
}

const ProcessAuditSummary: React.FC<ProcessAuditSummaryProps> = ({
  moduleId,
}) => {
  const moduleFilter =
    typeof moduleId === 'number' && Number.isFinite(moduleId)
      ? moduleId
      : undefined
  const { data = [], isFetching } = useGetProcessAuditsQuery(moduleFilter)
  const scopeLabel = moduleFilter
    ? 'el módulo seleccionado'
    : 'todos los módulos'

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
              (defectAcc: number, defect) =>
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
    <CustomCard loading={isFetching}>
      <CustomDivider>
        <CustomTitle level={5}>Auditorías recientes</CustomTitle>
      </CustomDivider>
      <CustomText
        type="secondary"
        style={{ display: 'block', marginBottom: 8 }}
      >
        Mostrando auditorías de {scopeLabel}.
      </CustomText>
      <ConditionalComponent
        condition={!!data?.length}
        fallback={<Empty description="Sin auditorías registradas" />}
      >
        <CustomSpace direction="vertical" size={12} style={{ width: '100%' }}>
          <CustomText>
            Auditorías registradas: <strong>{summary.total}</strong>
          </CustomText>
          <CustomText type="secondary">
            Defectos totales detectados: {summary.defects}
          </CustomText>
          <CustomText strong>Últimos reportes</CustomText>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data?.slice(0, 4).map((audit) => (
              <li key={audit.PROCESS_AUDIT_ID}>
                {formatAuditDate(audit.AUDIT_DATE)} ·{' '}
                {audit.SHIFT || 'Turno no especificado'} ·{' '}
                {audit.ENTRIES.length} operaciones
              </li>
            ))}
          </ul>
        </CustomSpace>
      </ConditionalComponent>
    </CustomCard>
  )
}

export default ProcessAuditSummary
