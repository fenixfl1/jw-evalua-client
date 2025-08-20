/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transfer, TransferProps } from 'antd'
import React from 'react'
import { TransferData } from 'src/types/general'

interface CustomTransferProps extends Omit<TransferProps, 'dataSource'> {
  dataSource: TransferData[]
}

const CustomTransfer: React.FC<CustomTransferProps> = ({
  showSearch = true,
  ...props
}) => {
  const filterOption = (inputValue: string, option: any) =>
    option.description.indexOf(inputValue) > -1

  return (
    <Transfer
      filterOption={filterOption}
      showSearch={showSearch}
      render={(item) => item.title}
      {...props}
    />
  )
}

export default CustomTransfer
