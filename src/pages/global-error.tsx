import React from 'react'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomResult from 'src/components/custom/CustomResult'
import styled from 'styled-components'
import CustomCol from 'src/components/custom/CustomCol'
import { message } from 'antd'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpace from 'src/components/custom/CustomSpace'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { PATH_HOME } from 'src/constants/routes'

const StackDescription = styled.div`
  position: relative;
  margin-top: 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
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

const Description = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
  text-align: center;
  width: 100%;
  max-width: 500px;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;
`

interface StateProps {
  hasError: boolean
  error?: Error
  errorInfo: string
}

interface ErrorBoundaryProps {
  children?: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, StateProps> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: undefined, errorInfo: '' }
  }

  static getDerivedStateFromError(error: Error): Partial<StateProps> {
    // eslint-disable-next-line no-console
    console.log({ error })
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo: errorInfo?.componentStack,
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <CustomRow justify="center" align="middle" height="100vh">
            <CustomCol xs={24} md={12} lg={8}>
              <CustomResult
                style={{ width: '100%' }}
                status={'error'}
                title={
                  <CustomTitle>
                    <code>{this.state.error?.cause?.toString()}</code>
                    <code>{this.state.error?.['code']}</code>
                  </CustomTitle>
                }
                subTitle={
                  <CustomSpace
                    direction="vertical"
                    split={<CustomDivider />}
                    width="100%"
                  >
                    <Description>{this.state.error.message}</Description>

                    <ConditionalComponent condition={!!this.state.error.stack}>
                      <CustomCol xs={24}>
                        <CustomCollapse
                          bordered={false}
                          items={[
                            {
                              key: 1,
                              label: 'Detalles del error',
                              children: (
                                <StackDescription>
                                  {this.state.error.stack}
                                  <p>
                                    {this.state.error.stack
                                      ?.replace(`Error: ${message}`, '')
                                      ?.replace(/\n/, '')
                                      ?.split(' at ')
                                      ?.map(
                                        (item: string, index: number) =>
                                          index > 0 && (
                                            <span key={index}>
                                              {item} <br />
                                            </span>
                                          )
                                      )}
                                  </p>
                                </StackDescription>
                              ),
                            },
                          ]}
                        />
                      </CustomCol>
                    </ConditionalComponent>
                  </CustomSpace>
                }
                extra={
                  <CustomSpace>
                    <CustomButton
                      icon={<HomeOutlined />}
                      onClick={() => (window.location.href = PATH_HOME)}
                      type="link"
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
                  </CustomSpace>
                }
              />
            </CustomCol>
          </CustomRow>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
