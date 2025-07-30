// ErrorPage.tsx
import {
  ReloadOutlined,
  SmileOutlined,
  CloseCircleOutlined,
  SmileFilled,
} from '@ant-design/icons'
import { useRouteError, isRouteErrorResponse } from 'react-router'
import CustomButton from './custom/CustomButton'
import CustomCollapse from './custom/CustomCollapse'
import { CustomParagraph } from './custom/CustomParagraph'
import CustomResult from './custom/CustomResult'
import { assert } from 'src/utils/assert'
import { useEffect } from 'react'

export default function ErrorPage() {
  const error = useRouteError()

  assert<Error>(error)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ error })
  }, [error])

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops!</h1>
        <p>Status: {error.status}</p>
        <p>{error.statusText}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignContent: 'center',
        justifyContent: 'center',
        background: '#333',
      }}
    >
      <CustomResult
        style={{ margin: 'auto' }}
        status="error"
        subTitle={
          <span style={{ fontSize: 14 }}>
            Intente nuevamente. Si el error persiste póngase en contacto con el
            equipo de soporte técnico.
          </span>
        }
        extra={[
          <CustomButton
            key="reload"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </CustomButton>,
        ]}
      >
        <div style={{ marginTop: '25px' }}>
          <CustomCollapse
            bordered={false}
            items={[
              {
                key: 0,
                label: 'Ver detalles',
                children: (
                  <>
                    <CustomButton
                      className="copy-icon-action"
                      type="link"
                      icon={<SmileOutlined />}
                    />
                    <CloseCircleOutlined
                      style={{ fontSize: 16, color: '#f5222d' }}
                    />
                    {error.message ?? 'Algo salio mal'}
                    <br />
                    <CustomParagraph
                      copyable={{
                        tooltips: ['Copiar detalle del error'],
                        icon: [
                          <SmileOutlined key="copy-icon" />,
                          <SmileFilled key="copied-icon" />,
                        ],
                      }}
                    >{`${error.stack}`}</CustomParagraph>
                  </>
                ),
              },
            ]}
          />
        </div>
      </CustomResult>
    </div>
  )
}
