import React from "react"
import {
  CheckCircleOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
} from "@ant-design/icons"
import { Modal } from "antd"

import { ModalFuncProps } from "antd/lib/modal"

type CustomModalFuncProps = Omit<ModalFuncProps, "open" | "visible"> & {
  visible?: boolean
  hideCancelButton?: boolean
}

export const CustomModalConfirmation = ({
  okButtonProps,
  cancelButtonProps,
  visible,
  okText = "Aceptar",
  cancelText = "Cancelar",
  ...props
}: CustomModalFuncProps): void => {
  Modal.confirm({
    open: visible,
    title: "Confirmar",
    content: "content: Alguna descripción",
    closable: true,
    okText,
    cancelText,
    cancelButtonProps: {
      icon: <StopOutlined className="disabledColor" />,
      ...cancelButtonProps,
    },
    okButtonProps: {
      icon: <CheckOutlined />,
      ...okButtonProps,
    },
    ...props,
  })
}

export const CustomModalError = ({
  okButtonProps,
  visible = false,
  okText = "Aceptar",
  cancelText = "Cancelar",
  ...props
}: CustomModalFuncProps): void => {
  Modal.error({
    title: "Error",
    open: visible,
    content: "A ocurrido un error.",
    okText,
    cancelText,
    okButtonProps: {
      icon: <CheckOutlined />,
      ...okButtonProps,
    },
    cancelButtonProps: {
      ...props.cancelButtonProps,
      style: { display: props.hideCancelButton ? "none" : "" },
    },
    ...props,
  })
}

export const CustomModalInfo = ({
  okButtonProps,
  okText = "Aceptar",
  cancelText = "Cancelar",
  visible = false,
  ...props
}: CustomModalFuncProps): void => {
  Modal.info({
    title: "Información",
    content: "Mensaje de información",
    open: visible,
    okText,
    cancelText,
    okButtonProps: {
      icon: <CheckOutlined />,
      ...okButtonProps,
    },
    cancelButtonProps: {
      ...props.cancelButtonProps,
      style: { display: props.hideCancelButton ? "none" : "" },
    },
    ...props,
  })
}

export const CustomModalSuccess = ({
  okText = "Aceptar",
  cancelText = "Cancelar",
  ...props
}: CustomModalFuncProps): void => {
  Modal.success({
    title: "Proceso completado con éxito",
    icon: <CheckCircleOutlined />,
    open: props.visible,
    content: "Proceso completado con éxito.",
    okText,
    cancelText,
    okButtonProps: {
      icon: <CheckOutlined />,
      ...props.okButtonProps,
    },
    cancelButtonProps: {
      ...props.cancelButtonProps,
      style: { display: props.hideCancelButton ? "none" : "" },
    },
    ...props,
  })
}

export const CustomModalWarning = (props: CustomModalFuncProps): void => {
  Modal.warning({
    title: "Advertencia",
    open: props.visible,
    icon: <ExclamationCircleOutlined />,
    okButtonProps: {
      icon: <CheckOutlined />,
      ...props.okButtonProps,
    },
    cancelButtonProps: {
      ...props.cancelButtonProps,
      style: { display: props.hideCancelButton ? "none" : "" },
    },
    content: "Advertencia",
    ...props,
  })
}
