import { SendOutlined } from '@ant-design/icons'
import { Form } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCard from 'src/components/custom/CustomCard'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomResult from 'src/components/custom/CustomResult'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import { PATH_LOGIN } from 'src/constants/routes'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useRequestResetPasswordMutation } from 'src/services/auth/useRequestResetPasswordMutation'

const ResetPasswordPage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [message, setMessage] = useState<string>()

  const { mutateAsync: requestResetPassword, isPending } =
    useRequestResetPasswordMutation()

  const handleOnFinish = async () => {
    try {
      const { EMAIL, USERNAME } = await form.validateFields()

      const response = await requestResetPassword({ USERNAME, EMAIL })

      setMessage(response)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <ConditionalComponent
      condition={!message}
      fallback={
        <CustomCard>
          <CustomResult
            status="success"
            title={'Operación exitosa'}
            subTitle={message}
            extra={[
              <CustomButton
                type="primary"
                key="login"
                onClick={() => navigate(PATH_LOGIN)}
              >
                Ir a Iniciar Sesión
              </CustomButton>,
            ]}
          />
        </CustomCard>
      }
    >
      <CustomCol xs={23} sm={12} lg={6} xl={5}>
        <CustomCard>
          <CustomTitle level={3}>Recuperar Contraseña</CustomTitle>

          <CustomForm
            form={form}
            layout={'vertical'}
            name={'dependencies'}
            autoComplete={'off'}
          >
            <CustomSpin spinning={isPending}>
              <CustomRow justify={'center'}>
                <CustomCol xs={24}>
                  <CustomFormItem
                    label={'Usuario'}
                    name={'USERNAME'}
                    rules={[{ required: true }]}
                  >
                    <CustomInput placeholder={'Nombre de usuario'} />
                  </CustomFormItem>
                </CustomCol>
                <CustomCol xs={24}>
                  <CustomFormItem
                    label={'Email'}
                    name={'EMAIL'}
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <CustomInput placeholder={'Correo'} />
                  </CustomFormItem>
                </CustomCol>
                <CustomButton
                  size={'middle'}
                  block
                  type={'primary'}
                  icon={<SendOutlined />}
                  onClick={handleOnFinish}
                >
                  Enviar
                </CustomButton>

                <CustomButton
                  style={{ marginTop: '15px' }}
                  onClick={() => navigate(PATH_LOGIN)}
                  type={'link'}
                >
                  Ir al inicio de sesión
                </CustomButton>
              </CustomRow>
            </CustomSpin>
          </CustomForm>
        </CustomCard>
      </CustomCol>
    </ConditionalComponent>
  )
}

export default ResetPasswordPage
