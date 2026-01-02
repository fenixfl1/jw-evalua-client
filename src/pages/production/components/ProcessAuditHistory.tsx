import React from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import { useGetProcessAuditsQuery } from 'src/services/production/useGetProcessAuditsQuery'
import {
  CustomParagraph,
  CustomText,
  CustomTitle,
} from 'src/components/custom/CustomParagraph'
import CustomTimeline from 'src/components/custom/CustomTimeline'
import CustomDivider from 'src/components/custom/CustomDivider'
import ConditionalComponent from 'src/components/ConditionalComponent'
import dayjs from 'dayjs'
import styled from 'styled-components'

const Container = styled.div`
  height: 192px;
  overflow: auto;
`

interface ProcessAuditHistoryProps {
  moduleId?: number
}

const formatAuditDate = (value?: string) => {
  if (!value) return 'Fecha no disponible'
  const [dateOnly] = value.split('T')
  const parsed = dayjs(dateOnly)
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : 'Fecha no disponible'
}

const ProcessAuditHistory: React.FC<ProcessAuditHistoryProps> = ({
  moduleId,
}) => {
  const { data = [] } = useGetProcessAuditsQuery(moduleId)

  return (
    <CustomCard>
      <CustomDivider>
        <CustomTitle level={5}>Auditorías recientes</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!data?.length}
        fallback={
          <CustomText type="secondary">
            Aún no se han registrado auditorías para este módulo.
          </CustomText>
        }
      >
        <Container>
          <CustomTimeline
            mode="left"
            items={data?.map((audit) => ({
              key: audit.PROCESS_AUDIT_ID,
              children: (
                <div>
                  <CustomParagraph>
                    <CustomText strong>
                      {formatAuditDate(audit.AUDIT_DATE)} ·{' '}
                      {audit.SHIFT || 'Turno no especificado'}
                    </CustomText>
                    <br />
                    <CustomText type="secondary">
                      Auditor: {audit.AUDITOR || 'No indicado'} <br />{' '}
                      Supervisor: {audit.SUPERVISOR || '—'}
                    </CustomText>
                    <ul style={{ marginLeft: 16 }}>
                      {audit.ENTRIES?.slice(0, 3).map((entry, index) => (
                        <li key={index}>
                          {entry.operation || 'Operación'} —{' '}
                          {entry.defects?.length || 0} defectos
                        </li>
                      ))}
                    </ul>
                  </CustomParagraph>
                </div>
              ),
            }))}
          />
        </Container>
      </ConditionalComponent>
    </CustomCard>
  )
}

export default ProcessAuditHistory
