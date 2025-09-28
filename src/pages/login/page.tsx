import { useForm } from 'antd/es/form/Form'
import React, { useEffect, useState } from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import CustomPasswordInput from 'src/components/custom/CustomPasswordInput'
import CustomRow from 'src/components/custom/CustomRow'
import { useAuthenticateUserMutation } from 'src/services/auth/useAuthenticateUserMutation'
import styled from 'styled-components'
import { useErrorHandler } from '../../hooks/use-error-handler'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import CustomCard from 'src/components/custom/CustomCard'

const Layout = styled.div`
  height: 100vh !important;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('assets/background2.jpg');
  background-repeat: no-repeat;
  background-size: cover;
`

const Card = styled(CustomCard)`
  box-shadow: ${({ theme }) => theme.boxShadow};
  height: 26rem;
`

const buttonStyle: React.CSSProperties = { width: '100%' }

const CustomLabel = ({ text }: { text: string }) => (
  <span style={{ padding: 0, marginBottom: -10 }}>{text}</span>
)

type LoginForm = {
  username: string
  password: string
}

const Login = () => {
  const [errorHandler] = useErrorHandler()
  const [form] = useForm<LoginForm>()
  const [remember, setRemember] = useState<boolean>()

  const { reset } = useMenuOptionStore()

  const { mutateAsync: authenticateUser, isPending } =
    useAuthenticateUserMutation()

  useEffect(reset, [])

  const handleFinish = async (values: LoginForm) => {
    try {
      await authenticateUser(values)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <Layout>
      <CustomCol xs={24} sm={14} md={10} lg={8} xl={6}>
        <Card>
          <CustomRow justify={'center'} align={'middle'} height={'100%'}>
            <img src={'assets/logo.png'} width={'30%'} />
            <CustomCol xs={24}>
              <CustomForm
                autoComplete={'off'}
                form={form}
                onFinish={handleFinish}
              >
                <CustomFormItem
                  label={<CustomLabel text="Usuario" />}
                  name="username"
                  rules={[{ required: true }]}
                  labelCol={{ span: 24 }}
                >
                  <CustomInput />
                </CustomFormItem>
                <CustomFormItem
                  label={<CustomLabel text="Contraseña" />}
                  name="password"
                  rules={[{ required: true }]}
                  labelCol={{ span: 24 }}
                >
                  <CustomPasswordInput />
                </CustomFormItem>
                <div style={{ margin: '25px 0' }} />
                <CustomCol xs={24}>
                  <CustomRow justify={'space-between'}>
                    <CustomFormItem>
                      <CustomCheckbox
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      >
                        Recordarme
                      </CustomCheckbox>
                    </CustomFormItem>

                    <CustomFormItem>
                      <CustomButton type={'link'}>
                        Olvide mi contraseña
                      </CustomButton>
                    </CustomFormItem>
                  </CustomRow>
                </CustomCol>
                <div style={{ margin: '25px 0' }} />
                <CustomFormItem>
                  <CustomRow justify="center">
                    <CustomButton
                      loading={isPending}
                      htmlType="submit"
                      type="primary"
                      style={buttonStyle}
                    >
                      Iniciar sesión
                    </CustomButton>
                  </CustomRow>
                </CustomFormItem>
              </CustomForm>
            </CustomCol>
          </CustomRow>
        </Card>
      </CustomCol>
    </Layout>
  )
}

export default Login
