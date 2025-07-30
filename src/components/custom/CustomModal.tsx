import React from 'react'
import { Modal, ModalProps } from 'antd'
import { CheckOutlined, StopOutlined } from '@ant-design/icons'

const CustomModal: React.FC<ModalProps> = ({
  okText = 'Aceptar',
  cancelText = 'Cancelar',
  okButtonProps,
  cancelButtonProps,
  closable = true,
  ...props
}) => {
  return (
    <Modal
      closable={closable}
      cancelButtonProps={{
        icon: <StopOutlined />,
        ...cancelButtonProps,
      }}
      okButtonProps={{
        icon: <CheckOutlined />,
        ...okButtonProps,
      }}
      okText={okText}
      cancelText={cancelText}
      {...props}
    >
      {props.children}
    </Modal>
  )
}

export default CustomModal
