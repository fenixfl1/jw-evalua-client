import { CheckOutlined, StopOutlined } from '@ant-design/icons'
import { App, ModalFuncProps } from 'antd'
import { useCallback } from 'react'

const customModalButtonProps = {
  style: { borderRadius: '5px' },
  size: 'small' as const,
}

export function useCustomModal() {
  const { modal } = App.useApp()

  const commonProps = {
    cancelButtonProps: {
      ...customModalButtonProps,
      icon: <StopOutlined className="disabledColor" />,
      ...customModalButtonProps,
    },
    okButtonProps: {
      icon: <CheckOutlined />,
      ...customModalButtonProps,
    },
  }

  const warningModal = useCallback(({ content, ...props }: ModalFuncProps) => {
    modal.warning({
      content:
        typeof content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        ),
      ...props,
      ...commonProps,
    })
  }, [])

  const successModal = useCallback(({ content, ...props }: ModalFuncProps) => {
    modal.success({
      content:
        typeof content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        ),
      ...props,
      ...commonProps,
    })
  }, [])

  const errorModal = useCallback(({ content, ...props }: ModalFuncProps) => {
    modal.error({
      content:
        typeof content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        ),
      ...props,
      ...commonProps,
    })
  }, [])

  const infoModal = useCallback(({ content, ...props }: ModalFuncProps) => {
    modal.error({
      content:
        typeof content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        ),
      ...props,
      ...commonProps,
    })
  }, [])

  const confirmModal = useCallback(({ content, ...props }: ModalFuncProps) => {
    modal.confirm({
      content:
        typeof content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        ),
      ...props,
      ...commonProps,
    })
  }, [])

  return { warningModal, successModal, errorModal, infoModal, confirmModal }
}
