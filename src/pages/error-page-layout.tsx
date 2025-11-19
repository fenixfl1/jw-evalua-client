import React from 'react'
import styled from 'styled-components'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomResult from 'src/components/custom/CustomResult'
import CustomCol from 'src/components/custom/CustomCol'
import CustomRow from 'src/components/custom/CustomRow'
import ConditionalComponent from 'src/components/ConditionalComponent'

const StackDescription = styled.div`
  position: relative;
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  width: 100%;
  max-width: 500px;
  max-height: 200px;
  height: 250px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-x: hidden;

  p {
    text-align: center;
  }
`

const Result = styled(CustomResult)`
  .ant-result-subtitle {
    color: ${({ theme: { isDark } }) => (isDark ? '#ffff' : '#333')};
  }
  .ant-result-content {
    background-color: transparent;
  }
`

const Container = styled(CustomRow)`
  background-color: ${({ theme: { isDark } }) =>
    isDark ? '#000000' : undefined};
  height: 100vh;
`

export type ErrorStatusCode = '403' | '404' | '500'

export interface ErrorPageLayoutProps {
  status: ErrorStatusCode
  title: string
  subTitle: React.ReactNode
  error?: unknown
  actions?: React.ReactNode
}

const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({
  status,
  title,
  subTitle,
  error,
  actions,
}) => {
  const stack = error instanceof Error ? error.stack : undefined

  const defaultActions = (
    <CustomRow justify={'center'} gap={10}>
      <CustomButton
        icon={<HomeOutlined />}
        type="link"
        onClick={() => (window.location.href = '/')}
      >
        Ir a inicio
      </CustomButton>
      <CustomButton
        icon={<ReloadOutlined />}
        onClick={() => window?.location.reload()}
        type="link"
      >
        Recargar página
      </CustomButton>
    </CustomRow>
  )

  return (
    <Container justify="center" align="middle">
      <CustomCol xs={24} md={12} lg={10}>
        <Result
          style={{ width: '100%' }}
          status={status}
          title={title}
          subTitle={subTitle}
          extra={actions ?? defaultActions}
        >
          <ConditionalComponent condition={!!stack}>
            <CustomCol xs={24}>
              <CustomCollapse
                size={'middle'}
                bordered={false}
                items={[
                  {
                    key: 1,
                    label: 'Detalles del error',
                    children: (
                      <StackDescription>
                        {stack?.split(' at ')?.map((item, index) =>
                          index > 0 ? (
                            <span key={index}>
                              {item}
                              <br />
                            </span>
                          ) : null
                        )}
                      </StackDescription>
                    ),
                  },
                ]}
              />
            </CustomCol>
          </ConditionalComponent>
        </Result>
      </CustomCol>
    </Container>
  )
}

export default ErrorPageLayout

export type StatusErrorPageProps = {
  error?: unknown
}
