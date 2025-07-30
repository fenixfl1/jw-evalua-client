import React from 'react'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomRow from 'src/components/custom/CustomRow'
import { formItemLayout, labelColFullWidth } from 'src/config/breakpoints'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomModal from 'src/components/custom/CustomModal'
import { Form } from 'antd'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle } from 'src/components/custom/CustomParagraph'

interface RolesFormProps {
  open?: boolean
  onClose?: () => void
}

const RolesForm: React.FC<RolesFormProps> = ({ open, onClose }) => {
  const [form] = Form.useForm()

  return (
    <CustomModal
      width={'40%'}
      closable
      title={'Formulario de Roles'}
      open={open}
      onCancel={onClose}
    >
      <CustomDivider />
      <CustomForm form={form} {...formItemLayout}>
        <CustomRow justify={'start'}>
          <CustomCol xs={24}>
            <CustomFormItem
              label={'Nombre'}
              name={'NAME'}
              rules={[{ required: true }]}
              {...labelColFullWidth}
            >
              <CustomInput placeholder={'Nombre del rol'} />
            </CustomFormItem>
          </CustomCol>
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
          <CustomDivider>
            <CustomTitle level={4}>Opciones de Menú</CustomTitle>
          </CustomDivider>
          <CustomDivider>
            <CustomTitle level={4}>Permisos</CustomTitle>
          </CustomDivider>
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default RolesForm
