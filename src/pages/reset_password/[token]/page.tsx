import { SendOutlined } from '@ant-design/icons'
import { Form } from 'antd'

import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCard from 'src/components/custom/CustomCard'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomPasswordInput from 'src/components/custom/CustomPasswordInput'
import CustomResult from 'src/components/custom/CustomResult'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import { PATH_LOGIN } from 'src/constants/routes'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useResetPasswordMutation } from 'src/services/auth/useResetPasswordMutation'

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [errorHandler] = useErrorHandler()

  const [message, setMessage] = useState<string>()

  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation()

  const { expires } = Object.fromEntries(
    new URLSearchParams(window.location.search)
  )

  const isExpired = new Date(Number(expires)).getTime() < new Date().getTime()

  const handleOnFinish = async () => {
    try {
      const { password } = await form.validateFields()

      const response = await resetPassword({ password, token })

      setMessage(response)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <ConditionalComponent
      condition={!message && !isExpired}
      fallback={
        <CustomCard>
          <CustomResult
            status={isExpired ? 'error' : 'success'}
            title={isExpired ? 'Token expirado' : 'Operación exitosa'}
            subTitle={
              !isExpired
                ? message
                : 'El token ha expirado. Debes solicitar uno nuevo.'
            }
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
          <CustomTitle level={3}>Cambiar Contraseña</CustomTitle>

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
                    label={'Nueva Contraseña'}
                    name={'password'}
                    rules={[{ required: true }]}
                  >
                    <CustomPasswordInput />
                  </CustomFormItem>
                </CustomCol>
                <CustomCol xs={24}>
                  <CustomFormItem
                    label={'Confirmar Contraseña'}
                    name={'password2'}
                    dependencies={['password']}
                    rules={[
                      {
                        required: true,
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(
                            new Error('Las contraseña no coinciden.')
                          )
                        },
                      }),
                    ]}
                  >
                    <CustomPasswordInput />
                  </CustomFormItem>
                </CustomCol>
                <CustomButton
                  block
                  size={'middle'}
                  type={'primary'}
                  icon={<SendOutlined />}
                  onClick={handleOnFinish}
                >
                  Recuperar Contraseña
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
