import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import { TeamGoal } from './Goals'

type Props = {
  open: boolean
  initial?: TeamGoal
  onCancel: () => void
  onSubmit: (
    values: Omit<TeamGoal, 'id' | 'groupId' | 'updatedAt' | 'periodName'> & {
      id?: number
    }
  ) => void
}

const GoalForm: React.FC<Props> = ({ open, initial, onCancel, onSubmit }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (initial) {
      form.setFieldsValue({
        id: initial.id,
        name: initial.name,
        unit: initial.unit,
        weight: initial.weight,
        target: initial.target,
        actual: initial.actual ?? 0,
        owner: initial.owner,
        periodId: initial.periodId,
        status: initial.status,
        dueDate: initial.dueDate ? dayjs(initial.dueDate) : undefined,
        description: initial.description,
      })
    } else {
      form.resetFields()
    }
  }, [initial, form])

  return (
    <Modal
      open={open}
      title={initial ? 'Editar meta de equipo' : 'Nueva meta de equipo'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Guardar"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            ...values,
            dueDate: values.dueDate?.format('YYYY-MM-DD'),
          })
        }
      >
        <Form.Item name="id" hidden>
          <input />
        </Form.Item>

        <Form.Item
          label="Nombre de la meta"
          name="name"
          rules={[{ required: true, message: 'Ingresa el nombre' }]}
        >
          <Input placeholder="Ej. Aumentar producción mensual" />
        </Form.Item>

        <Form.Item label="Unidad" name="unit">
          <Input placeholder="% / pzas / $" />
        </Form.Item>

        <Form.Item
          label="Objetivo (target)"
          name="target"
          rules={[{ required: true, message: 'Ingresa el objetivo' }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Valor actual" name="actual" initialValue={0}>
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Peso (%)" name="weight" initialValue={0}>
          <InputNumber min={0} max={100} step={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Periodo"
          name="periodId"
          rules={[{ required: true, message: 'Selecciona el periodo' }]}
        >
          <Select
            options={[
              { value: 1, label: 'Q1 2025' },
              { value: 2, label: 'Q2 2025' },
            ]}
            placeholder="Selecciona un periodo"
          />
        </Form.Item>

        <Form.Item label="Responsable" name="owner">
          <Input />
        </Form.Item>

        <Form.Item label="Fecha límite" name="dueDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Estado" name="status" initialValue="Activa">
          <Select
            options={[
              { value: 'Activa', label: 'Activa' },
              { value: 'En curso', label: 'En curso' },
              { value: 'Atrasada', label: 'Atrasada' },
              { value: 'Completada', label: 'Completada' },
              { value: 'Archivada', label: 'Archivada' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Descripción" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default GoalForm
