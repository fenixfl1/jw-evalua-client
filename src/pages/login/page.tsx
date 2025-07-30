import { useForm } from 'antd/es/form/Form'
import React, { useState } from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import CustomLayout from 'src/components/custom/CustomLayout'
import CustomPasswordInput from 'src/components/custom/CustomPasswordInput'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSider from 'src/components/custom/CustomSider'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useAuthenticateUserMutation } from 'src/services/auth/useAuthenticateUserMutation'
import { errorHandler } from 'src/utils/error-handler'
import styled from 'styled-components'

const Sider = styled(CustomSider)`
  background-color: ${({ theme: { isDark, colorBgLayout } }) =>
    isDark ? '#001529' : colorBgLayout} !important;
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
`

const LogoContainer = styled.div`
  height: 100vh;
  width: calc(100vw - 600px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme: { isDark, colorBgLayout } }) =>
    isDark ? '#141414' : colorBgLayout} !important;
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
  const [form] = useForm<LoginForm>()
  const [remember, setRemember] = useState<boolean>()

  const { mutateAsync: authenticateUser, isPaused } =
    useAuthenticateUserMutation()

  const handleFinish = async (values: LoginForm) => {
    try {
      await authenticateUser(values)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <>
      <CustomSpin spinning={isPaused}>
        <CustomLayout hasSider style={{ border: '1px solid yellow' }}>
          <LogoContainer>
            <img width={'60%'} src={'assets/logo.png'} />
          </LogoContainer>

          <Sider width={600}>
            <CustomRow
              style={{ height: 'inherit' }}
              justify={'center'}
              align={'middle'}
            >
              <CustomForm
                style={{
                  width: '80%',
                  padding: '0 20px',
                }}
                autoComplete={'off'}
                form={form}
                onFinish={handleFinish}
              >
                <img width={'100%'} src={'assets/logo.png'} />
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
                <CustomFormItem>
                  <CustomRow justify="center">
                    <CustomButton
                      htmlType="submit"
                      type="primary"
                      style={buttonStyle}
                    >
                      Iniciar sesión
                    </CustomButton>
                  </CustomRow>
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
              </CustomForm>
            </CustomRow>
          </Sider>
        </CustomLayout>
      </CustomSpin>
    </>
  )
}

export default Login
