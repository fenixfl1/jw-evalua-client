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
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomRadioGroup from 'src/components/custom/CustomRadioGroup'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import { useCreateStaffMutation } from 'src/services/staff/useCreateStaffMutation'
import { Staff } from 'src/services/staff/staff.types'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import CustomSelect from 'src/components/custom/CustomSelect'
import moment from 'moment'
import { useUpdateStaffMutation } from 'src/services/staff/useUpdateStaffMutation'
import queryClient from 'src/lib/query-client'

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
  const [errorHandler] = useErrorHandler()
  const notification = useAppNotification()
  const [form] = Form.useForm<Staff>()

  const isEditing = !!record?.STAFF_ID

  const { mutateAsync: createStaff, isPending: isCreateStaffPending } =
    useCreateStaffMutation()
  const { mutateAsync: updateStaff, isPending: isUpdatePending } =
    useUpdateStaffMutation()

  useEffect(() => {
    form.setFieldsValue({ ...record, BIRTH_DATE: moment(record?.BIRTH_DATE) })
  }, [record])

  const handleOnFinish = async () => {
    try {
      const data = await form.validateFields()

      let message = 'Empleado Registrado exitosamente.'

      if (isEditing) {
        await updateStaff({ ...data })
        message = 'Empleado actualizado exitosamente.'
        queryClient.invalidateQueries({
          queryKey: ['staff', 'get-one-staff', data.STAFF_ID],
        })
      } else {
        await createStaff(data)
      }
      notification({
        message: 'Operación exitosa',
        description: message,
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
      <CustomSpin spinning={isCreateStaffPending || isUpdatePending}>
        <CustomForm form={form} {...formItemLayout}>
          <CustomRow justify={'start'}>
            <CustomFormItem hidden name={'STAFF_ID'} />
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
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Estado'}
                name={'STATE'}
                rules={[{ required: true }]}
                initialValue={'A'}
              >
                <CustomSelect
                  options={[
                    { label: 'Activo', value: 'A' },
                    { label: 'Inactivo', value: 'I' },
                  ]}
                />
              </CustomFormItem>
            </CustomCol>
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
                label={'Fecha Nac.'}
                name={'BIRTH_DATE'}
                rules={[{ required: true }]}
              >
                <CustomDatePicker />
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
