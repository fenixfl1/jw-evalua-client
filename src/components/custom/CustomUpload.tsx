import React, { useState } from "react"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"
import { Upload, UploadProps } from "antd"
import { UploadFile } from "antd/lib/upload/interface"
import { UploadRequestOption } from "rc-upload/lib/interface"
import { getBase64 } from "@/helpers/base64-helpers"
import sleep from "@/helpers/sleep"
import { CustomButton, CustomModal, CustomRow } from "."
import ConditionalComponent from "../ConditionalComponent"
import styled from "styled-components"

const Button = styled(CustomButton)`
  padding: 10px !important;
  width: 100% !important;
  background-color: ${({ theme }) => theme.textColor} !important;

  .ant-upload-icon {
    width: 100%;
    font-size: 44px !important;
  }

  .ant-upload-text .ant-upload-hint {
    color: ${({ theme }) => theme.textColor} !important;
  }
`

interface CustomUploadProps extends UploadProps {
  key?: React.Key
  multiple?: boolean
  onUpload?(file: UploadFile): Promise<boolean>
  readonly?: boolean
  title?: string
  label?: string
}

const CustomUpload: React.FC<CustomUploadProps> = ({
  action = "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  listType = "picture-card",
  multiple = false,
  onUpload,
  accept,
  readonly,
  title,
  fileList = [],
  label,
  ...props
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState("")
  const [previewImage, setPreviewImage] = useState("")

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as unknown as string
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
    setPreviewTitle(
      file.name ||
        (file.url?.substring(file.url?.lastIndexOf("/") + 1) as string)
    )
  }

  const dummyRequest = async (options: UploadRequestOption) => {
    const { file, onError, onSuccess } = options
    let isOk = true
    await sleep(500)
    if (typeof onUpload === "function") isOk = await onUpload?.(file as never)

    if (!isOk) {
      onError?.({ status: 500 } as never)
    } else onSuccess?.(file, { status: 200 } as never)
  }

  const handleCancel = () => setPreviewOpen(false)

  const uploadButton = (
    <ConditionalComponent
      condition={listType === "picture-card"}
      fallback={
        <Button icon={<UploadOutlined />} block>
          {label}
        </Button>
      }
    >
      <CustomButton type="link" icon={<UploadOutlined />} disabled={readonly}>
        Cargar {props.children}
      </CustomButton>
    </ConditionalComponent>
  )

  return (
    <>
      <Upload
        accept={accept}
        action={action}
        customRequest={dummyRequest}
        listType={listType}
        onPreview={handlePreview}
        fileList={Array.isArray(fileList) ? fileList : undefined}
        {...props}
      >
        {fileList.length >= 1 && !multiple ? null : uploadButton}
      </Upload>

      <CustomModal
        open={previewOpen}
        title={title ?? previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="previewTitle" style={{ width: "100%" }} src={previewImage} />
      </CustomModal>
    </>
  )
}

export default CustomUpload
