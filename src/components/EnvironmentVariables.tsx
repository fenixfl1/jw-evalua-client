import React, { useContext, useEffect, useRef, useState } from 'react'
import CustomSpace from './custom/CustomSpace'
import { CustomTitle } from './custom/CustomParagraph'
import CustomCard from './custom/CustomCard'
import CustomDivider from './custom/CustomDivider'
import styled from 'styled-components'
import CustomTable from './custom/CustomTable'
import { Form, FormInstance, InputRef, TableProps } from 'antd'
import ConditionalComponent from './ConditionalComponent'
import CustomFormItem from './custom/CustomFormItem'
import CustomInput from './custom/CustomInput'
import CustomForm from './custom/CustomFrom'
import CustomTooltip from './custom/CustomTooltip'
import CustomButton from './custom/CustomButton'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import CustomRow from './custom/CustomRow'
import { EnvItem } from 'src/services/env/env.types'

interface EnvironmentVariablesProps {
  dataSource: EnvItem[]
}

interface EditableRowProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableRowElement>,
    HTMLTableRowElement
  > {
  index: number
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  dataIndex: keyof EnvItem
  record: EnvItem
  handleSave: (record: EnvItem) => void
}

type ColumnTypes = Exclude<TableProps<EnvItem>['columns'], undefined>

const Card = styled(CustomCard)`
  .ant-list {
    max-height: 500px;
    overflow-x: auto;
  }
`

const EditableContext = React.createContext<FormInstance>(null)

const EditableRow: React.FC<EditableRowProps> = ({ ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error })
      //
    }
  }

  return (
    <td {...restProps}>
      <ConditionalComponent
        condition={editing && editable}
        fallback={
          <ConditionalComponent condition={editable} fallback={children}>
            <CustomTooltip title={'Click para editar'}>
              <div
                className={'editable-cell-value-wrap'}
                style={{ paddingInlineEnd: 24 }}
                onClick={toggleEdit}
              >
                <CustomRow justify={'space-between'}>
                  {children}
                  <EditOutlined className={'editable-cell-edit-icon'} />
                </CustomRow>
              </div>
            </CustomTooltip>
          </ConditionalComponent>
        }
      >
        <CustomFormItem
          noStyle
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[{ required: true, message: `${title} is required.` }]}
        >
          <CustomInput
            variant={'filled'}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        </CustomFormItem>
      </ConditionalComponent>
    </td>
  )
}

const EnvironmentVariables: React.FC<EnvironmentVariablesProps> = ({
  dataSource,
}) => {
  const [form] = Form.useForm()

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean
    dataIndex?: string
  })[] = [
    {
      dataIndex: 'key',
      key: 'key',
      editable: true,
      width: '50%',
    },
    {
      dataIndex: 'value',
      key: 'value',
      editable: true,
      render: () => '**********************',
      width: '42%',
    },
    {
      width: '8%',
      key: 'actions',
      render: () => (
        <CustomTooltip title={'Eliminar'}>
          <CustomButton
            size={'large'}
            type={'link'}
            icon={<DeleteOutlined />}
            danger
          />
        </CustomTooltip>
      ),
    },
  ]

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: EnvItem) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    }
  })

  return (
    <Card>
      <CustomSpace>
        <CustomDivider>
          <CustomTitle level={4}>Variables de entorno</CustomTitle>
        </CustomDivider>

        <CustomForm component={false} form={form}>
          <CustomTable
            title={() => (
              <CustomRow justify={'end'}>
                <CustomButton icon={<PlusOutlined />}>Agregar</CustomButton>
              </CustomRow>
            )}
            components={components}
            rowClassName={() => 'editable-row'}
            pagination={{ defaultPageSize: 8 }}
            dataSource={dataSource}
            showHeader={false}
            columns={columns as never}
          />
        </CustomForm>
      </CustomSpace>
    </Card>
  )
}

export default EnvironmentVariables
