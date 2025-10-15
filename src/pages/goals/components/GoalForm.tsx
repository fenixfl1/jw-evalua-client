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

interface GoalFormProps {
  open: boolean
  record?: Goal
  onCancel: () => void
}

const GoalForm: React.FC<GoalFormProps> = ({ open, record, onCancel }) => {
  const [form] = Form.useForm()

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
        FECHAS: [dayjs(record.START_DATE), dayjs(record.END_DATE)],
      })
    }
  }, [record])

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()

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

  return (
    <CustomModal
      open={open}
      title={record ? 'Editar meta de equipo' : 'Nueva meta de equipo'}
      onCancel={onCancel}
      onOk={handleFinish}
      okText={'Guardar'}
    >
      <CustomSpin spinning={isCreatePending || isUpdatePending}>
        <CustomForm form={form} {...formItemLayout}>
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
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default GoalForm
