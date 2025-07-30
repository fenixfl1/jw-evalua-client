import React from 'react'
import styled from 'styled-components'
import CustomRow from './custom/CustomRow'
import CustomSpin from './custom/CustomSpin'

interface FallbackProp {
  width?: string | number
  height?: string | number
  fullScreen?: boolean
}

const FallbackContainer = styled.div<{ fullScreen?: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${(props) => (props.fullScreen ? '100vw' : 'auto')};
  height: ${(props) => (props.fullScreen ? '100vh' : 'auto')};
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`

const Fallback: React.FC<FallbackProp> = ({
  width = '100%',
  height = '100vh',
  fullScreen = false,
}) => {
  return (
    <FallbackContainer fullScreen={fullScreen}>
      <CustomRow
        align={'middle'}
        width={width}
        height={height}
        justify={'center'}
      >
        <CustomSpin
          spinning
          size={'large'}
          tip={<img width={'90%'} src={'/assets/text.svg'} />}
        />
      </CustomRow>
    </FallbackContainer>
  )
}

export default Fallback
