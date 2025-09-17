import React from 'react'
import { CustomParagraph } from 'src/components/custom/CustomParagraph'
import { useMenuOptionStore } from 'src/store/menu-options.store'

const Page: React.FC = () => {
  const { currenMenuOption } = useMenuOptionStore()

  return (
    <CustomParagraph>
      <div dangerouslySetInnerHTML={{ __html: currenMenuOption?.CONTENT }} />
    </CustomParagraph>
  )
}

export default Page
