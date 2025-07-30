import React from 'react'
import styled from 'styled-components'
import { DownOutlined } from '@ant-design/icons'
import { Collapse as AntCollapse, CollapseProps } from 'antd'

const Collapse = styled(AntCollapse)`
  background-color: ${({ theme: { isDark } }) =>
    isDark ? 'transparent' : '#ffff '} !important;
  color: ${({ theme }) => theme.colorText} !important;

  .ant-collapse-item {
    border: none !important;
    border-radius: ${({ theme }) => theme.borderRadius}px !important;
    background-color: ${({ theme: { isDark } }) =>
      isDark ? '#141414' : '#f5f5f5'} !important;
  }

  .ant-collapse-item:not(:last-child) {
    margin-bottom: 10px !important;
  }

  .ant-collapse-header {
    display: flex !important;
    align-items: center !important;
    padding: 8px 10px !important;

    .ant-collapse-header-text {
      font-size: 16px !important;
      font-weight: 500;
    }
  }
`

const CustomCollapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ bordered = false, expandIconPosition = 'end', ...props }, ref) => {
    return (
      <Collapse
        ref={ref}
        bordered={bordered}
        expandIconPosition={expandIconPosition}
        expandIcon={({ isActive }) => (
          <DownOutlined style={{ fontSize: 16 }} rotate={isActive ? 180 : 0} />
        )}
        {...props}
      />
    )
  }
)
export default CustomCollapse
