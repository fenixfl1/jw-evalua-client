/* eslint-disable @typescript-eslint/no-explicit-any */

import { DownloadOutlined, TableOutlined } from '@ant-design/icons'
import { Form, InputRef } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { formItemLayout, defaultBreakpoints } from 'src/config/breakpoints'
import ConditionalComponent from './ConditionalComponent'
import CustomButton from './custom/CustomButton'
import CustomCheckbox from './custom/CustomCheckbox'
import CustomCheckboxGroup from './custom/CustomCheckboxGroup'
import CustomCol from './custom/CustomCol'
import CustomFormItem from './custom/CustomFormItem'
import CustomForm from './custom/CustomFrom'
import CustomInput from './custom/CustomInput'
import CustomModal from './custom/CustomModal'
import CustomPopover from './custom/CustomPopover'
import CustomRow from './custom/CustomRow'
import CustomSelect from './custom/CustomSelect'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { exportToPDF, exportToExcel, exportToCSV } from 'src/utils/report-utils'
import { ColumnsMap } from './custom/CustomTable'

const options = [
  {
    label: 'PDF',
    value: 'pdf',
  },
  {
    label: 'Excel',
    value: 'xlsx',
  },
  {
    label: 'CSV',
    value: 'csv',
  },
]

interface ExportOptionsProps<T = any> {
  dataSource: readonly T[]
  open: boolean
  onCancel: () => void
  ref: React.ForwardedRef<any> | null
  columnsMap?: ColumnsMap
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  dataSource,
  open,
  onCancel,
  ref,
  columnsMap = {},
}) => {
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const title = Form.useWatch('title', form)
  const reportFormat = Form.useWatch('format', form)

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    Object.keys(columnsMap).map((col) => col)
  )

  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [inputRef])

  useEffect(() => {
    if (title && reportFormat) {
      form.setFieldValue(
        'filename',
        title.replace(/\s/g, '_')?.toLowerCase() + `.${reportFormat}`
      )
    }
  }, [title, reportFormat])

  const handleExport = async () => {
    try {
      const values = await form.validateFields()

      values.ref = ref
      values.columnsMap = columnsMap
      values.data = dataSource

      // eslint-disable-next-line no-console
      console.log({ values })

      switch (values.format) {
        case 'pdf':
          await exportToPDF(values)
          break
        case 'xlsx':
          await exportToExcel(values)
          break
        case 'csv':
          await exportToCSV(values)
          break
        default:
          break
      }

      onCancel?.()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error })
      errorHandler(error)
    }
  }

  const columnOptions = Object.entries(columnsMap ?? {}).flatMap(
    ([key, def]) => {
      if (typeof def === 'string') {
        // Columna simple
        return [{ label: def, value: key, style: { width: '100%' } }]
      }
      // Columna agrupada: una opción por cada subcolumna
      return (def.children ?? []).map((child) => ({
        label: `${def.header} · ${child.header}`,
        value: `${key}.${child.key}`, // valor compuesto
        style: { width: '100%' },
      }))
    }
  )

  const columnContent = (
    <div style={{ maxWidth: '250px' }}>
      <CustomCheckboxGroup
        value={selectedColumns}
        onChange={setSelectedColumns}
        options={columnOptions}
      />
    </div>
  )

  return (
    <CustomModal
      closable={false}
      open={open}
      onCancel={onCancel}
      onOk={handleExport}
      okText={'Exportar'}
      title={'Opciones de Exportación'}
      okButtonProps={{ icon: <DownloadOutlined /> }}
      width={'550px'}
    >
      <CustomForm form={form} {...formItemLayout}>
        <CustomRow>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label={'Formato'}
              name={'format'}
              rules={[{ required: true }]}
              labelCol={{ xs: 10 }}
            >
              <CustomSelect
                placeholder={'Seleccionar formato'}
                options={options}
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label={'Orientación'}
              name={'orientation'}
              rules={[{ required: true }]}
              initialValue={'portrait'}
              labelCol={{ xs: 10 }}
            >
              <CustomSelect
                disabled={reportFormat !== 'pdf'}
                placeholder={'Seleccionar formato'}
                options={[
                  { label: 'Horizontal', value: 'landscape' },
                  { label: 'Vertical', value: 'portrait' },
                ]}
              />
            </CustomFormItem>
          </CustomCol>
          <ConditionalComponent condition={reportFormat === 'pdf'}>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Titulo'}
                name={'title'}
                rules={[{ required: true }]}
                labelCol={{ xs: 5 }}
              >
                <CustomInput
                  ref={inputRef}
                  placeholder={'Titulo del reporte'}
                />
              </CustomFormItem>
            </CustomCol>
          </ConditionalComponent>
          <CustomCol xs={24}>
            <CustomFormItem
              label={'Nombre Archivo'}
              name={'filename'}
              initialValue={'reporte'}
              rules={[{ required: true }]}
              labelCol={{ xs: 5 }}
            >
              <CustomInput ref={inputRef} placeholder={'Nombre del archivo'} />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <ConditionalComponent condition={!!Object.keys(columnsMap).length}>
              <CustomFormItem label={' '} colon={false}>
                <CustomPopover content={columnContent}>
                  <CustomButton
                    type={'text'}
                    size={'large'}
                    icon={<TableOutlined />}
                  >
                    Columnas
                  </CustomButton>
                </CustomPopover>
              </CustomFormItem>
            </ConditionalComponent>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label={' '}
              colon={false}
              name={'showHead'}
              valuePropName={'checked'}
              labelCol={{ xs: 10 }}
              initialValue={true}
            >
              <CustomCheckbox>¿Incluir Cabeceras?</CustomCheckbox>
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints} />
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default ExportOptions
