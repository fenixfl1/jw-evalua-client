import React from "react"
import { Form, Upload, UploadFile } from "antd"
import { UploadChangeParam, UploadProps } from "antd/lib/upload"
import { UploadRef } from "antd/lib/upload/Upload"
import { InboxOutlined } from "@ant-design/icons"
import sleep from "@/helpers/sleep"
import ConditionalComponent from "../ConditionalComponent"
import { useFormContext } from "@/context/form"
import { useFormItemContext } from "@/context/form-item"
import { NamePath } from "antd/es/form/interface"

const { Dragger } = Upload

interface CustomDraggerProps extends UploadProps {
  description?: string
}

const CustomDragger = React.forwardRef<UploadRef, CustomDraggerProps>(
  (
    {
      accept = "application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf",
      description = "Clic o arrastra el archivo a esta área para subir",
      multiple = false,
      action = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
      disabled,
      onChange,
      onRemove,
      ...props
    },
    ref
  ) => {
    const { form } = useFormContext()
    const { name, readonly } = useFormItemContext()
    const files = Form.useWatch(name as NamePath, form)
    const [fileList, setFileList] = React.useState<UploadFile[]>([])

    const handleOnChange = (info: UploadChangeParam<UploadFile<any>>) => {
      if (readonly) return
      const fileList = multiple
        ? info.fileList
        : info.fileList?.filter((item) => item.uid === info.file.uid)
      setFileList(fileList)
      onChange?.(info)
    }

    const dummyRequest = async (options: any) => {
      const { file, onError, onSuccess } = options
      let isOk = true
      await sleep(500)

      if (!isOk) {
        onError?.({ status: 500 } as never)
        form?.resetFields([name as string])
      } else onSuccess?.(file, { status: 200 } as never)
    }

    const handleOnRemove = (file: UploadFile) => {
      if (readonly) return
      onRemove?.(file)
    }

    return (
      <Dragger
        accept={accept}
        action={action}
        customRequest={dummyRequest}
        disabled={readonly || disabled}
        fileList={fileList}
        multiple={multiple}
        onChange={handleOnChange}
        onRemove={handleOnRemove}
        ref={ref}
        {...props}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{description}</p>
        <p className="ant-upload-hint">
          Soporta subida única o múltiple. Está estrictamente prohibido subir
          datos de la empresa u otros archivos prohibidos.
        </p>
      </Dragger>
    )
  }
)

export default CustomDragger
