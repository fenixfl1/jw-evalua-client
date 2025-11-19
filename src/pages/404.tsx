import React from 'react'
import ErrorPageLayout, {
  StatusErrorPageProps,
} from './error-page-layout'

const NotFound: React.FC<StatusErrorPageProps> = ({ error }) => {
  return (
    <ErrorPageLayout
      status="404"
      title="404"
      subTitle="No pudimos encontrar la página que estás buscando."
      error={error}
    />
  )
}

export default NotFound
