import React from 'react'
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
// import CustomMaskedInput from 'src/components/custom/CustomMaskedInput'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomRadioGroup from 'src/components/custom/CustomRadioGroup'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import { useCreateStaffMutation } from 'src/services/staff/useCreateStaffMutation'
import { errorHandler } from 'src/utils/error-handler'
import { Staff } from 'src/services/staff/staff.types'
import { useAppNotification } from 'src/context/NotificationContext'

interface EmployeesFormProps {
  open?: boolean
  onClose?: () => void
  record?: Staff
}

const EmployeesForm: React.FC<EmployeesFormProps> = ({
  open,
  onClose,
  record,
}) => {
  const notification = useAppNotification()
  const [form] = Form.useForm()

  const isEditing = !!record?.STAFF_ID

  const { mutateAsync: createStaff, isPending: isCreateStaffPending } =
    useCreateStaffMutation()

  const handleOnFinish = async () => {
    try {
      const data = await form.validateFields()

      await createStaff(data)
      notification({
        message: 'Operación exitosa',
        description: 'Empleado Registrado exitosamente.',
      })

      form.resetFields()
      onClose?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <CustomModal
      title={'Formulario de empleados'}
      open={open}
      onCancel={onClose}
      width={'50%'}
      onOk={handleOnFinish}
      okText={isEditing ? 'Actualizar' : 'Guardar'}
    >
      <CustomSpin spinning={isCreateStaffPending}>
        <CustomForm form={form} {...formItemLayout}>
          <CustomRow justify={'space-between'}>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Cédula'}
                name={'IDENTITY_DOCUMENT'}
                rules={[{ required: true }]}
              >
                {/* <CustomMaskedInput mask={'999-9999999-9'} /> */}
                <CustomInput placeholder={''} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints} />
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Nombres'}
                name={'NAME'}
                rules={[{ required: true }]}
              >
                <CustomInput placeholder={'Nombres'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Apellidos'}
                name={'LAST_NAME'}
                rules={[{ required: true }]}
              >
                <CustomInput placeholder={'Apellidos'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Teléfono'}
                name={'PHONE'}
                rules={[{ required: false }]}
              >
                {/* <CustomMaskedInput mask={'(999) 999-999'} /> */}
                <CustomInput placeholder={''} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Correo'}
                name={'EMAIL'}
                rules={[{ required: false, type: 'email' }]}
              >
                <CustomInput placeholder={'user@example.com'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Sexo'}
                name={'GENDER'}
                rules={[{ required: true }]}
              >
                <CustomRadioGroup
                  options={[
                    { label: 'Masculino', value: 'M' },
                    { label: 'Femenino', value: 'F' },
                  ]}
                />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Fecha Nac.'}
                name={'BIRTH_DATA'}
                rules={[{ required: true }]}
              >
                <CustomDatePicker />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Dirección'}
                name={'ADDRESS'}
                {...labelColFullWidth}
              >
                <CustomTextArea placeholder={'Dirección'} />
              </CustomFormItem>
            </CustomCol>
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default EmployeesForm
