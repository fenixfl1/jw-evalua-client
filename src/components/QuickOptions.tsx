import React from 'react'
import CustomRow from './custom/CustomRow'
import {
  CircleFadingArrowUp,
  RefreshCcw,
  CircleOff,
  SlidersHorizontal,
} from 'lucide-react'
import { useParams } from 'react-router'
import CustomCol from './custom/CustomCol'
import CustomCard from './custom/CustomCard'
import CustomFlex from './custom/CustomFlex'
import { CustomText } from './custom/CustomParagraph'
import styled from 'styled-components'

const cardBreakpoints = { xs: 24, sm: 12, md: 6 }

const Text = styled(CustomText)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const QuickOptions: React.FC = () => {
  const { name } = useParams()

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({ name })
  }, [name])

  const quickOptions = [
    {
      key: '0',
      label: 'Actualizaciones',
      icon: <CircleFadingArrowUp />,
    },
    {
      key: '1',
      label: 'Reiniciar servicio(s)',
      icon: <RefreshCcw />,
    },
    {
      key: '2',
      label: 'Detener servicio(s)',
      icon: <CircleOff />,
    },
    {
      key: '3',
      label: 'Variables de entorno',
      icon: <SlidersHorizontal />,
    },
  ]

  return (
    <CustomRow gutter={[16, 16]} width={'100%'}>
      {quickOptions.map((option) => (
        <CustomCol {...cardBreakpoints} style={{ height: '100%' }}>
          <CustomCard hoverable>
            <CustomFlex gap={10}>
              {option.icon}
              <Text>{option.label}</Text>
            </CustomFlex>
          </CustomCard>
        </CustomCol>
      ))}
    </CustomRow>
  )
}

export default QuickOptions
