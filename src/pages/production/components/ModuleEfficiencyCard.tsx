import { App, Form } from 'antd'
import React, { useEffect } from 'react'
import CustomCard from 'src/components/custom/CustomCard'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomInput from 'src/components/custom/CustomInput'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomRow from 'src/components/custom/CustomRow'
import CustomCol from 'src/components/custom/CustomCol'
import { useSaveModuleEfficiencyMutation } from 'src/services/production/useSaveModuleEfficiencyMutation'
import { useGetModuleEfficiencyQuery } from 'src/services/production/useGetModuleEfficiencyQuery'
import { useGetModuleWorkedMinutesQuery } from 'src/services/production/useGetModuleWorkedMinutesQuery'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomForm from 'src/components/custom/CustomFrom'
import { getSessionInfo } from 'src/lib/session'
import { QuestionCircleOutlined } from '@ant-design/icons'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CustomSpaceCompact from 'src/components/custom/CustomSpaceCompact'
import CustomSpace from 'src/components/custom/CustomSpace'

interface ModuleEfficiencyCardProps {
  moduleId?: number
  period?: number
}

const ModuleEfficiencyCard: React.FC<ModuleEfficiencyCardProps> = ({
  moduleId,
  period,
}) => {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const [errorHandler] = useErrorHandler()

  const { data, refetch, isFetching } = useGetModuleEfficiencyQuery(
    moduleId,
    period
  )
  const { mutateAsync: saveEfficiency, isPending } =
    useSaveModuleEfficiencyMutation()
  const {
    data: workedTime,
    isFetching: isLoadingWorkedTime,
    refetch: refetchWorkedTime,
  } = useGetModuleWorkedMinutesQuery(moduleId, period)

  useEffect(() => {
    form.setFieldsValue({
      PERIOD: period,
    })
  }, [period, form])

  useEffect(() => {
    if (workedTime?.minutesWorked !== undefined) {
      form.setFieldsValue({
        MINUTES_WORKED: Number(workedTime.minutesWorked ?? 0),
      })
    }
  }, [workedTime, form])

  const handleSubmit = async () => {
    try {
      if (!moduleId) {
        message.warning('Selecciona un módulo válido.')
        return
      }
      const values = await form.validateFields()

      await saveEfficiency({
        MODULE_ID: moduleId,
        PERIOD: Number(values.PERIOD ?? period),
        TOTAL_UNITS: Number(values.TOTAL_UNITS),
        SAM: Number(values.SAM),
        MINUTES_WORKED: Number(
          workedTime?.minutesWorked ?? values.MINUTES_WORKED ?? 0
        ),
        NOTES: values.NOTES,
      })

      await Promise.all([refetch(), refetchWorkedTime()])
      form.resetFields(['TOTAL_UNITS', 'SAM', 'NOTES'])
      message.success('Eficiencia registrada.')
    } catch (error) {
      errorHandler(error)
    }
  }

  const initialValues = {
    PERIOD: period,
    MINUTES_WORKED: workedTime?.minutesWorked ?? 0,
  }

  return (
    <CustomCard loading={isFetching || isLoadingWorkedTime}>
      <CustomDivider>
        <CustomTitle level={5}>Eficiencia del módulo</CustomTitle>
      </CustomDivider>
      <CustomForm
        readonly={!['2'].includes(getSessionInfo().roleId)}
        layout="vertical"
        form={form}
        initialValues={initialValues}
      >
        <CustomRow gutter={16}>
          <CustomCol xs={24} md={12}>
            <CustomFormItem
              label="Prendas totales"
              name="TOTAL_UNITS"
              rules={[{ required: true }]}
            >
              <CustomInputNumber
                min={0}
                precision={0}
                placeholder="Cantidad producida"
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol xs={24} md={12}>
            <CustomFormItem
              label="SAM (min)"
              name="SAM"
              rules={[{ required: true }]}
            >
              <CustomInputNumber
                min={0}
                precision={2}
                placeholder="Minutos por prenda"
              />
            </CustomFormItem>
          </CustomCol>
        </CustomRow>
        <CustomRow gutter={16}>
          <CustomCol xs={24} md={12}>
            <CustomFormItem
              label="Minutos trabajados"
              rules={[{ required: true }]}
            >
              <CustomSpaceCompact>
                <CustomFormItem
                  label="Minutos trabajados"
                  name="MINUTES_WORKED"
                  rules={[{ required: true }]}
                  noStyle
                >
                  <CustomInputNumber
                    min={0}
                    precision={2}
                    placeholder="Se calcula con los timers de los operarios"
                    disabled
                  />
                </CustomFormItem>
              </CustomSpaceCompact>
              <CustomTooltip
                title={`Tiempo sumado de las sesiones registradas en las tareas del
                módulo
                ${
                  workedTime?.activeSessions
                    ? ` · Sesiones activas: ${workedTime.activeSessions}`
                    : ''
                }`}
              >
                <QuestionCircleOutlined
                  style={{ cursor: 'help', marginLeft: 5, color: '#40a9ff' }}
                />
              </CustomTooltip>
            </CustomFormItem>
          </CustomCol>
          <CustomCol xs={24} md={12}>
            <CustomFormItem label="Notas" name="NOTES">
              <CustomInput placeholder="Observaciones" />
            </CustomFormItem>
          </CustomCol>
        </CustomRow>
        <ConditionalComponent
          condition={['2'].includes(getSessionInfo().roleId)}
        >
          <CustomSpace direction={'horizontal'}>
            <CustomButton
              type="primary"
              onClick={handleSubmit}
              loading={isPending}
              disabled={isLoadingWorkedTime}
            >
              Calcular y guardar
            </CustomButton>
            <CustomButton
              style={{ marginLeft: 8 }}
              onClick={() => refetchWorkedTime()}
              loading={isLoadingWorkedTime}
              disabled={!moduleId}
            >
              Actualizar minutos
            </CustomButton>
          </CustomSpace>
        </ConditionalComponent>
      </CustomForm>

      <CustomDivider />
      <CustomText strong>Historial reciente</CustomText>
      <ConditionalComponent
        condition={!!data?.length}
        fallback={
          <CustomText type="secondary">
            <br />
            No hay registros de eficiencia para este módulo.
          </CustomText>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data?.map((record) => (
            <div
              key={record.MODULE_EFFICIENCY_ID}
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <CustomText>
                Periodo {record.PERIOD}: {record.EFFICIENCY_PERCENT}% eficiencia
              </CustomText>
              <CustomText type="secondary">
                Prendas: {record.TOTAL_UNITS} · SAM: {record.SAM} · Minutos:{' '}
                {record.MINUTES_WORKED}
              </CustomText>
              {record.NOTES && (
                <CustomText type="secondary">Nota: {record.NOTES}</CustomText>
              )}
            </div>
          ))}
        </div>
      </ConditionalComponent>
    </CustomCard>
  )
}

export default ModuleEfficiencyCard
