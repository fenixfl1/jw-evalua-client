import React from 'react'
import { Form, Input, InputNumber, DatePicker, Modal } from 'antd'
import dayjs from 'dayjs'

type Props = {
  open: boolean
  onCancel: () => void
  onSubmit: (values: {
    DESCRIPTION: string
    START_DATE: string
    END_DATE: string
    WEIGHT: number
  }) => void
}

const ModuleGoalForm: React.FC<Props> = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title="Nueva meta de módulo"
      okText="Crear"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            DESCRIPTION: values.DESCRIPTION,
            START_DATE: values.DATE_RANGE?.[0]?.startOf('day')?.toISOString(),
            END_DATE: values.DATE_RANGE?.[1]?.endOf('day')?.toISOString(),
            WEIGHT: values.WEIGHT,
          })
        }
      >
        <Form.Item
          name="DESCRIPTION"
          label="Descripción"
          rules={[{ required: true, message: 'Ingresa la descripción' }]}
        >
          <Input placeholder="Ej. Aumentar producción mensual" />
        </Form.Item>

        <Form.Item
          name="DATE_RANGE"
          label="Periodo (fecha inicio/fin)"
          rules={[{ required: true, message: 'Selecciona el rango de fechas' }]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }}
            format="YYYY-MM-DD"
            disabledDate={(d) => d.isBefore(dayjs().subtract(2, 'year'))}
          />
        </Form.Item>

        <Form.Item
          name="WEIGHT"
          label="Peso (%)"
          rules={[{ required: true, message: 'Ingresa el peso' }]}
          initialValue={10}
        >
          <InputNumber min={0} max={100} step={1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ModuleGoalForm

