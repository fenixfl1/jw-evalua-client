import { useRouteError } from 'react-router-dom'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomResult from 'src/components/custom/CustomResult'
import styled from 'styled-components'
import CustomCol from 'src/components/custom/CustomCol'
import CustomRow from 'src/components/custom/CustomRow'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { AppError } from 'src/utils/app-error'

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

const RouteErrorElement = () => {
  const error = useRouteError() as AppError

  return (
    <Container justify="center" align="middle">
      <CustomCol xs={24} md={12} lg={10}>
        <Result
          style={{ width: '100%' }}
          status={'error'}
          subTitle={
            <span style={{ fontSize: 14 }}>
              Intente nuevamente. Si el error persiste póngase en contacto con
              el equipo de soporte técnico.
            </span>
          }
          extra={
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
          }
        >
          <div>
            <ConditionalComponent condition={!!error.stack}>
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
                          {error.stack?.split(' at ')?.map((item, index) =>
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
          </div>
        </Result>
      </CustomCol>
    </Container>
  )
}

export default RouteErrorElement
