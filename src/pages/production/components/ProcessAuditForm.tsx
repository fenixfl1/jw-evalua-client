import { App, Form } from 'antd'
import React, { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomModal from 'src/components/custom/CustomModal'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomDivider from 'src/components/custom/CustomDivider'
import { useCreateProcessAuditMutation } from 'src/services/production/useCreateProcessAuditMutation'
import dayjs from 'dayjs'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import CustomRow from 'src/components/custom/CustomRow'
import CustomCol from 'src/components/custom/CustomCol'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomCard from 'src/components/custom/CustomCard'
import { useGetUserPaginationMutation } from '../../../services/users/useGetUserPaginationMutation'
import { AdvancedCondition } from 'src/types/general'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getSessionInfo } from 'src/lib/session'
import { useCustomModal } from 'src/hooks/use-custom-modal'
import { useModuleStore } from 'src/store/module.store'
import { CustomParagraph } from 'src/components/custom/CustomParagraph'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useGetModuleGoalsMutation } from 'src/services/work_modules/useGetModuleGoalsMutation'
import { useGetMemberTasksMutation } from 'src/services/work_modules/useMemberTasksMutation'

interface ProcessAuditFormProps {
  open: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const ProcessAuditForm: React.FC<ProcessAuditFormProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const entries = Form.useWatch('ENTRIES', form)
  const goalId = Form.useWatch('STYLE', form)

  const { message } = App.useApp()
  const { confirmModal } = useCustomModal()
  const [errorHandler] = useErrorHandler()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId')

  const [, period] = useGetPeriods()

  const { mutateAsync: createAudit, isPending } =
    useCreateProcessAuditMutation()

  const {
    mutate: getOperator,
    data: { data: operatorList },
  } = useGetUserPaginationMutation()
  const { mutate: getModuleGoals, data: moduleGoals } =
    useGetModuleGoalsMutation()
  const { mutate: getMembersTasks, data: membersTasks } =
    useGetMemberTasksMutation()

  const { workModules } = useModuleStore()

  const module = workModules.find((item) => String(item.MODULE_ID) === moduleId)

  const handleGetModuleGoals = useCallback(() => {
    getModuleGoals({
      condition: {
        MODULE_ID: module?.MODULE_ID,
        PERIOD: period,
      },
    })
  }, [period, module])

  useEffect(handleGetModuleGoals, [handleGetModuleGoals])

  const handleGetMemberTasks = useCallback(
    (staffIdValue: number) => {
      if (!moduleId) {
        return
      }

      const memberId = Number(staffIdValue)
      if (!Number.isFinite(memberId) || memberId <= 0) {
        return
      }

      const payload = {
        condition: {
          MODULE_ID: Number(moduleId),
          PERIOD: period,
          MEMBER_ID: memberId,
          ...(typeof goalId === 'number' ? { GOAL_ID: goalId } : {}),
        },
      }

      getMembersTasks(payload)
    },
    [goalId, moduleId, period, getMembersTasks]
  )

  const handleSearchOperator = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
      {
        value: moduleId,
        field: 'MODULE_ID',
        operator: '=',
      },
    ]

    getOperator({ page: 1, size: 100, condition })
  }, [])

  useEffect(handleSearchOperator, [handleSearchOperator])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!moduleId) {
        message.warning('Selecciona un módulo para registrar la auditoría.')
        return
      }

      const auditDateValue = values.AUDIT_DATE
      const formattedDate =
        typeof auditDateValue === 'string'
          ? auditDateValue
          : dayjs(auditDateValue).format('YYYY-MM-DD')

      await createAudit({
        MODULE_ID: Number(moduleId),
        AUDIT_DATE: formattedDate,
        SHIFT: values.SHIFT,
        STYLE: values.STYLE,
        SUPERVISOR: values.SUPERVISOR_ID,
        AUDITOR: values.AUDITOR,
        COMMENTS: values.COMMENTS,
        ENTRIES: (values.ENTRIES ?? []).map((entry) => ({
          operation: entry?.operation,
          operator: entry?.operator,
          timeSlot: entry?.timeSlot,
          samples: entry?.samples,
          comments: entry?.comments,
          defects:
            entry?.defects
              ?.filter(
                (defect) =>
                  defect?.type && Number.isFinite(Number(defect?.count))
              )
              ?.map((defect) => ({
                type: defect.type,
                count: Number(defect.count ?? 0),
              })) ?? [],
        })),
      })

      message.success('Auditoría registrada.')
      form.resetFields()
      onSuccess?.()
      onCancel?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ entries })
  }, [entries])

  const initialValues = {
    AUDIT_DATE: dayjs(),
    ENTRIES: [{}],
  }

  const handleClose = () => {
    confirmModal({
      onOk: onCancel,
      title: 'Confirmación',
      content:
        'Sí cierra la ventana perderá cualquier información que halla introducido.',
    })
  }

  return (
    <CustomModal
      title="Nueva auditoría en proceso"
      open={open}
      width="65%"
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Guardar"
      okButtonProps={{ loading: isPending }}
    >
      <CustomForm form={form} {...formItemLayout} initialValues={initialValues}>
        <CustomRow>
          <CustomFormItem
            name={'SUPERVISOR_ID'}
            hidden
            initialValue={module?.SUPERVISOR_ID}
          />
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label="Fecha"
              name="AUDIT_DATE"
              rules={[{ required: true }]}
            >
              <CustomDatePicker disabled format="YYYY-MM-DD" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Turno" name="SHIFT">
              <CustomInput placeholder="Turno / horario" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Estilo" name="STYLE">
              <CustomSelect
                placeholder="Seleccionar"
                options={moduleGoals.map((item) => ({
                  label: item.DESCRIPTION,
                  value: item.GOAL_ID,
                }))}
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label="Supervisor"
              name="SUPERVISOR"
              initialValue={module?.SUPERVISOR_NAME}
            >
              <CustomInput readOnly />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              hidden
              label="Auditor"
              name="AUDITOR"
              initialValue={getSessionInfo().userId}
            >
              <CustomInput placeholder="Nombre del auditor" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Comentarios generales" name="COMMENTS">
              <CustomInput placeholder="Observaciones" />
            </CustomFormItem>
          </CustomCol>

          <CustomDivider>Observaciones por operación</CustomDivider>
          <CustomCol xs={24}>
            <CustomFormItem label={' '} colon={false} {...labelColFullWidth}>
              <CustomCollapseFormList
                addText={'Agregar Operación'}
                form={form}
                name={'ENTRIES'}
                itemLabel={(index) => {
                  const { operator, operation } = entries?.[index] ?? {}
                  const task = membersTasks.find(
                    (item) => item.GOAL_TASK_ID === operation
                  )
                  const user = operatorList.find(
                    (item) => item.STAFF_ID === operator
                  )

                  return `${task?.['TASK_DESCRIPTION']} - ${user?.NAME}`
                }}
              >
                {(field) => (
                  <CustomRow justify={'start'} gutter={[16, 16]}>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Operario"
                        name={[field.name, 'operator']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomSelect
                          onSelect={(value) => {
                            form.resetFields([
                              ['ENTRIES', field.name, 'operation'],
                            ])
                            handleGetMemberTasks(Number(value))
                          }}
                          placeholder={'Seleccionar Operario'}
                          options={operatorList.map((item) => ({
                            label: `${item.NAME} ${item.LAST_NAME}`,
                            value: item.STAFF_ID,
                          }))}
                        />
                      </CustomFormItem>
                    </CustomCol>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Operación"
                        name={[field.name, 'operation']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomSelect
                          placeholder={'Descripción de operación'}
                          options={membersTasks?.map((task) => ({
                            label: task['TASK_DESCRIPTION'],
                            value: task.GOAL_TASK_ID,
                          }))}
                        />
                      </CustomFormItem>
                    </CustomCol>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Horario"
                        name={[field.name, 'timeSlot']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomInput placeholder="Ej. 7:45 - 10:00 am" />
                      </CustomFormItem>
                    </CustomCol>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Muestreos"
                        name={[field.name, 'samples']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomInputNumber min={0} precision={0} />
                      </CustomFormItem>
                    </CustomCol>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Comentarios"
                        name={[field.name, 'comments']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomInput placeholder="Observaciones específicas" />
                      </CustomFormItem>
                    </CustomCol>

                    <CustomDivider>Defectos encontrados</CustomDivider>
                    <CustomCol xs={24}>
                      <CustomCard>
                        <CustomCollapseFormList
                          addButtonPosition={'bottom'}
                          addText={'Agregar Defectos'}
                          form={form}
                          name={[field.name, 'defects']}
                          itemLabel={(index) =>
                            entries?.[field.name]?.defects?.[index]?.type
                          }
                        >
                          {(defectField) => (
                            <CustomSpace
                              direction={'horizontal'}
                              key={defectField.key}
                              size={12}
                            >
                              <CustomFormItem
                                label="Defecto"
                                name={[defectField.name, 'type']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Ingrese el nombre del defecto.',
                                  },
                                ]}
                              >
                                <CustomInput placeholder="Tipo de defecto" />
                              </CustomFormItem>
                              <CustomFormItem
                                label="Cantidad"
                                name={[defectField.name, 'count']}
                                rules={[{ required: true }]}
                              >
                                <CustomInputNumber min={0} precision={0} />
                              </CustomFormItem>
                            </CustomSpace>
                          )}
                        </CustomCollapseFormList>
                      </CustomCard>
                    </CustomCol>
                  </CustomRow>
                )}
              </CustomCollapseFormList>
            </CustomFormItem>
          </CustomCol>

          {/* <ConditionalComponent condition> */}
          <CustomCol xs={24}>
            <CustomFormItem label={' '} colon={false} {...labelColFullWidth}>
              {() => (
                <CustomParagraph>
                  <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                </CustomParagraph>
              )}
            </CustomFormItem>
          </CustomCol>
          {/* </ConditionalComponent> */}
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default ProcessAuditForm
