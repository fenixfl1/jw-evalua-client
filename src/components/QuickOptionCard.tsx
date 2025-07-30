import React from 'react'
import CustomCard from './custom/CustomCard'
import CustomCol from './custom/CustomCol'
import CustomFlex from './custom/CustomFlex'
import styled from 'styled-components'
import { CustomText } from './custom/CustomParagraph'

const cardBreakpoints = { xs: 24, sm: 12, md: 6 }

const Text = styled(CustomText)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface QuickOptionCardProps {
  icon: React.ReactNode
  label: React.ReactNode
}

const QuickOptionCard: React.FC<QuickOptionCardProps> = ({ icon, label }) => {
  return (
    <CustomCol {...cardBreakpoints} style={{ height: '100%', margin: '5px 0' }}>
      <CustomCard hoverable>
        <CustomFlex gap={10}>
          {icon}
          <Text>{label}</Text>
        </CustomFlex>
      </CustomCard>
    </CustomCol>
  )
}

export default QuickOptionCard
