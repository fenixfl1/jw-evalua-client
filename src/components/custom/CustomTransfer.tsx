import { Transfer, TransferProps } from 'antd'
import React from 'react'
import { TransferData } from 'src/types/general'

interface CustomTransferProps extends Omit<TransferProps, 'dataSource'> {
  dataSource: TransferData[]
}

const CustomTransfer: React.FC<CustomTransferProps> = ({
  showSearch = true,
  filterOption,
  ...props
}) => {
  const defaultFilterOption: TransferProps['filterOption'] = (
    inputValue,
    option
  ) => (option.description ?? '').indexOf(inputValue) > -1

  return (
    <Transfer
      filterOption={filterOption ?? defaultFilterOption}
      showSearch={showSearch}
      render={(item) => item.title}
      {...props}
    />
  )
}

export default CustomTransfer
