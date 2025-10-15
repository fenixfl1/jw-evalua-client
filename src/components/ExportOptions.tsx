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
import CustomTextArea from './custom/CustomTextArea'
import CustomModal from './custom/CustomModal'
import CustomPopover from './custom/CustomPopover'
import CustomRow from './custom/CustomRow'
import CustomSelect from './custom/CustomSelect'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { exportToPDF, exportToExcel, exportToCSV } from 'src/utils/report-utils'
import type {
  ColumnMapValue,
  ColumnsMap,
  GroupCol,
  SimpleColumn,
} from './custom/CustomTable'

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

type ColumnDefinition = ColumnMapValue<any>

const isGroupColumn = (value: ColumnDefinition): value is GroupCol<any> =>
  typeof value === 'object' &&
  value !== null &&
  'children' in value &&
  Array.isArray((value as GroupCol<any>).children)

const isSimpleColumnObject = (
  value: ColumnDefinition
): value is SimpleColumn<any> =>
  typeof value === 'object' && value !== null && !isGroupColumn(value)

const getSimpleLabel = (value: ColumnDefinition): string | undefined => {
  if (typeof value === 'string') {
    return value
  }
  if (isSimpleColumnObject(value)) {
    return value.header
  }
  return undefined
}

const collectColumnValues = (map?: ColumnsMap): string[] => {
  if (!map) return []
  const values: string[] = []
  Object.entries(map).forEach(([key, definition]) => {
    if (isGroupColumn(definition)) {
      definition.children?.forEach((child) => {
        if (child.key) {
          values.push(`${key}.${child.key}`)
        }
      })
    } else {
      values.push(key)
    }
  })
  return values
}

export interface ExportFormValue {
  format?: 'pdf' | 'xlsx' | 'csv'
  orientation?: 'landscape' | 'portrait'
  title?: string
  filename?: string
  showHead?: boolean
  extraHeaderHtml?: string
}
interface ExportOptionsProps<T = any> {
  dataSource: readonly T[]
  open: boolean
  onCancel: () => void
  ref: React.ForwardedRef<any> | null
  columnsMap?: ColumnsMap
  initialValues?: Partial<ExportFormValue>
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  dataSource,
  open,
  onCancel,
  ref,
  initialValues,
  columnsMap = {},
}) => {
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const title = Form.useWatch('title', form)
  const reportFormat = Form.useWatch('format', form)

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    collectColumnValues(columnsMap)
  )

  useEffect(() => {
    setSelectedColumns(collectColumnValues(columnsMap))
  }, [columnsMap])
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
      errorHandler(error)
    }
  }

  const columnOptions = Object.entries(columnsMap ?? {}).flatMap(
    ([key, definition]) => {
      if (isGroupColumn(definition)) {
        return (definition.children ?? []).map((child) => ({
          label: `${definition.header} - ${child.header}`,
          value: `${key}.${child.key}`,
          style: { width: '100%' },
        }))
      }

      const label = getSimpleLabel(definition)
      return label ? [{ label, value: key, style: { width: '100%' } }] : []
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
      <CustomForm
        form={form}
        initialValues={{
          format: 'pdf',
          orientation: 'portrait',
          showHead: true,
          filename: 'Reporte',
          extraHeaderHtml: '',
          ...initialValues,
        }}
        {...formItemLayout}
      >
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
              rules={[{ required: true }]}
              labelCol={{ xs: 5 }}
            >
              <CustomInput ref={inputRef} placeholder={'Nombre del archivo'} />
            </CustomFormItem>
          </CustomCol>
          <CustomCol xs={24}>
            <CustomFormItem
              label={'Encabezado extra'}
              name={'extraHeaderHtml'}
              labelCol={{ xs: 5 }}
              hidden
            >
              <CustomTextArea
                rows={4}
                maxLength={1500}
                showCount={false}
                placeholder={'<div>Contenido adicional del reporte</div>'}
              />
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
