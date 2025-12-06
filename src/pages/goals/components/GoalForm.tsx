import React, { useEffect } from 'react'
import { Form } from 'antd'
import CustomModal from 'src/components/custom/CustomModal'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomForm from 'src/components/custom/CustomFrom'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import CustomRow from 'src/components/custom/CustomRow'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useCreateGoalMutation } from 'src/services/goals/useCreateGoalMutation'
import { Goal } from 'src/services/goals/types'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import dayjs from 'dayjs'
import { useCustomNotifications } from 'src/hooks/use-custom-notifications'
import { useUpdateGoalMutation } from 'src/services/goals/useUpdateGoalMutation'
import ConditionalComponent from 'src/components/ConditionalComponent'
import GoalTasksForm from 'src/pages/production/components/GoalTasksForm'
import CustomDivider from 'src/components/custom/CustomDivider'
import {
  CustomParagraph,
  CustomTitle,
} from 'src/components/custom/CustomParagraph'
import { useCustomModal } from 'src/hooks/use-custom-modal'

interface GoalFormProps {
  open: boolean
  record?: Goal
  onCancel: () => void
}

const GoalForm: React.FC<GoalFormProps> = ({ open, record, onCancel }) => {
  const [form] = Form.useForm()

  const { confirmModal } = useCustomModal()

  const { mutateAsync: createGoal, isPending: isCreatePending } =
    useCreateGoalMutation()
  const { mutateAsync: updateGoal, isPending: isUpdatePending } =
    useUpdateGoalMutation()

  const [errorHandler] = useErrorHandler()
  const { successNotification } = useCustomNotifications()

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        TASK_TEMPLATES: record.TASK_TEMPLATES?.length
          ? record.TASK_TEMPLATES
          : [{}],
        FECHAS: [dayjs(record.START_DATE), dayjs(record.END_DATE)],
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ TASK_TEMPLATES: [{}] })
    }
  }, [record, form])

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()

      const rawTemplates: {
        DESCRIPTION?: string
        COMMENT?: string
        TARGET?: number
        UNITS_PER_ITEM?: number
      }[] = Array.isArray(values.TASK_TEMPLATES) ? values.TASK_TEMPLATES : []
      values.TASK_TEMPLATES = rawTemplates
        .map((task) => {
          const description = String(task?.DESCRIPTION ?? '').trim()
          const comment =
            typeof task?.COMMENT === 'string' ? task.COMMENT.trim() : undefined
          const target = Number(task?.TARGET ?? 0)
          const unitsRaw = Number(task?.UNITS_PER_ITEM ?? 1)

          return {
            DESCRIPTION: description,
            COMMENT: comment || undefined,
            TARGET: Number.isFinite(target) ? Math.round(target) : 0,
            UNITS_PER_ITEM:
              Number.isFinite(unitsRaw) && unitsRaw > 0 ? Number(unitsRaw) : 1,
          }
        })
        .filter((task) => task.DESCRIPTION && task.TARGET > 0)

      delete values.FECHAS

      let description = 'Meta creada con éxito'
      if (record?.GOAL_ID) {
        await updateGoal({ ...values })
        description = `Meta con id '${values.GOAL_ID}' actualizada con éxito`
      } else {
        await createGoal(values)
      }
      successNotification({
        message: 'Operación exitosa',
        description,
      })
      onCancel?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleOnCancel = () => {
    confirmModal({
      title: 'Confirmación',
      onOk: onCancel,
      okText: 'Cerrar',
      content: (
        <div>
          <p>
            Si cierra la ventana perderá cualquier información que halla
            introducido
          </p>
          <p>¿Desea cerrar?</p>
        </div>
      ),
    })
  }

  return (
    <CustomModal
      open={open}
      title={record ? 'Editar meta de equipo' : 'Nueva meta de equipo'}
      onCancel={handleOnCancel}
      onOk={handleFinish}
      okText={'Guardar'}
      width={'45%'}
    >
      <CustomSpin spinning={isCreatePending || isUpdatePending}>
        <CustomForm
          form={form}
          initialValues={{ TASK_TEMPLATES: [{}] }}
          {...formItemLayout}
        >
          <CustomRow justify={'end'}>
            <ConditionalComponent condition={!!record?.GOAL_ID}>
              <CustomFormItem label={'ID'} name={'GOAL_ID'}>
                <CustomInput readOnly />
              </CustomFormItem>
            </ConditionalComponent>
            <CustomFormItem
              hidden
              name={'START_DATE'}
              rules={[{ required: true }]}
            />
            <CustomFormItem
              hidden
              name={'END_DATE'}
              rules={[{ required: true }]}
            />
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Descripción'}
                name={'DESCRIPTION'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomInput placeholder={'Descripción'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Rango Fecha'}
                name={'FECHAS'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomRangePicker
                  minDate={dayjs()}
                  width={'100%'}
                  placeholder={['Fecha inicio', 'Fecha Fin']}
                  onChange={([start, end]) =>
                    form.setFieldsValue({ START_DATE: start, END_DATE: end })
                  }
                />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Objetivo'}
                name={'TARGET_VALUE'}
                rules={[{ required: true }]}
              >
                <CustomInputNumber
                  width={'100%'}
                  format={{ format: 'default' }}
                  placeholder={'Objetivo'}
                />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem label={'Peso %'} name={'WEIGHT'}>
                <CustomInputNumber
                  width={'100%'}
                  format={{ format: 'percent' }}
                />
              </CustomFormItem>
            </CustomCol>

            <CustomDivider>
              <CustomTitle level={5}>Tareas</CustomTitle>
            </CustomDivider>

            <GoalTasksForm form={form} name={['TASK_TEMPLATES']} />

            <ConditionalComponent condition={false}>
              <CustomCol xs={24}>
                <CustomFormItem
                  label={' '}
                  colon={false}
                  {...labelColFullWidth}
                >
                  {() => (
                    <CustomParagraph>
                      <pre>
                        {JSON.stringify(form.getFieldsValue(), null, 2)}
                      </pre>
                    </CustomParagraph>
                  )}
                </CustomFormItem>
              </CustomCol>
            </ConditionalComponent>
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default GoalForm
