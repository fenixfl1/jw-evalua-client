import { App, Form } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
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
import useDebounce from 'src/hooks/use-debounce'
import { AdvancedCondition } from 'src/types/general'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getSessionInfo } from 'src/lib/session'

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

  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { message } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('moduleId')

  const { mutateAsync: createAudit, isPending } =
    useCreateProcessAuditMutation()
  const {
    mutate: getSupervisors,
    data: { data: supervisorList },
  } = useGetUserPaginationMutation()

  const {
    mutate: getOperator,
    data: { data: operatorList },
  } = useGetUserPaginationMutation()

  const handleSearchSupervisor = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
      {
        value: 2,
        field: 'ROLE_ID',
        operator: '=',
      },
    ]

    if (debounce) {
      condition.push({
        value: debounce,
        field: 'FILTER',
        operator: 'LIKEN',
      })
    }

    getSupervisors({ page: 1, size: 100, condition })
  }, [debounce])

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

  useEffect(handleSearchSupervisor, [handleSearchSupervisor])
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
        SUPERVISOR: values.SUPERVISOR,
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

  const initialValues = {
    AUDIT_DATE: dayjs(),
    ENTRIES: [{}],
  }

  return (
    <CustomModal
      title="Nueva auditoría en proceso"
      open={open}
      width="65%"
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Guardar"
      okButtonProps={{ loading: isPending }}
    >
      <CustomForm form={form} {...formItemLayout} initialValues={initialValues}>
        <CustomRow>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label="Fecha"
              name="AUDIT_DATE"
              rules={[{ required: true }]}
            >
              <CustomDatePicker format="YYYY-MM-DD" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Turno" name="SHIFT">
              <CustomInput placeholder="Turno / horario" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Estilo" name="STYLE">
              <CustomInput placeholder="Código o descripción del estilo" />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Supervisor" name="SUPERVISOR">
              <CustomSelect
                onSearch={setSearchKey}
                placeholder="Supervisor responsable"
                options={supervisorList.map((item) => ({
                  label: `${item.NAME} ${item.LAST_NAME}`,
                  value: item.USER_ID,
                }))}
              />
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
                itemLabel={(index) => entries?.[index]?.operation}
              >
                {(field) => (
                  <CustomRow justify={'start'} gutter={[16, 16]}>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Operación"
                        name={[field.name, 'operation']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomInput placeholder={'Descripción de operación'} />
                      </CustomFormItem>
                    </CustomCol>
                    <CustomCol {...defaultBreakpoints}>
                      <CustomFormItem
                        label="Operario"
                        name={[field.name, 'operator']}
                        labelCol={{ span: 8 }}
                      >
                        <CustomSelect
                          placeholder={'Seleccionar Operario'}
                          options={operatorList.map((item) => ({
                            label: `${item.NAME} ${item.LAST_NAME}`,
                            value: item.USER_ID,
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
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default ProcessAuditForm
