import React from 'react'
import ErrorPageLayout, {
  StatusErrorPageProps,
} from './error-page-layout'

const Forbidden: React.FC<StatusErrorPageProps> = ({ error }) => {
  return (
    <ErrorPageLayout
      status="403"
      title="403"
      subTitle="No tienes permisos para ver esta sección."
      error={error}
    />
  )
}

export default Forbidden
