import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomTable from 'src/components/custom/CustomTable'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { Staff } from 'src/services/staff/staff.types'
import { useStaffStore } from 'src/store/staff.store'
import formatter from 'src/utils/formatter'
import { getTablePagination } from 'src/utils/table-pagination'

interface EmployeesTableProps {
  onChange: (page: number, size: number) => void
  onUpdate?: (record: Staff) => void
  onEdit?: (staffId: number) => void
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({
  onChange,
  onUpdate,
  onEdit,
}) => {
  const { modal } = App.useApp()
  const { metadata, staffList } = useStaffStore()

  const handleUpdate = async (record: Staff) => {
    modal.confirm({
      title: 'Aviso, Cambio de estado',
      onOk: () => onUpdate(record),
      content: (
        <p>
          Seguro que desea cambiar el estado del empleado <br />
          <strong>
            "{record.NAME} {record.LAST_NAME}"
          </strong>
          ?
        </p>
      ),
    })
  }

  const columns: ColumnsType<Staff> = [
    {
      dataIndex: 'STAFF_ID',
      key: 'STAFF_ID',
      title: 'Código',
      align: 'center',
      width: '5%',
    },
    {
      dataIndex: 'NAME',
      key: 'NAME',
      title: 'NOMBRE',
    },
    {
      dataIndex: 'LAST_NAME',
      key: 'LAST_NAME',
      title: 'Apellidos',
    },
    {
      dataIndex: 'IDENTITY_DOCUMENT',
      key: 'IDENTITY_DOCUMENT',
      title: 'Cédula',
      render: (value) => formatter({ value, format: 'document' }),
    },
    {
      dataIndex: 'EMAIL',
      key: 'EMAIL',
      title: 'Correo',
    },
    {
      dataIndex: 'STATE',
      key: 'STATE',
      title: 'Estado',
      width: '10%',
      align: 'center',
      render: (value) => (value === 'A' ? 'ACTIVO' : 'INACTIVO'),
    },
    {
      dataIndex: 'STATE',
      key: 'STATE',
      title: 'Acciones',
      width: '5%',
      align: 'center',
      render: (value: string, record) => (
        <CustomSpace
          direction={'horizontal'}
          split={<CustomDivider type={'vertical'} style={{ margin: 0 }} />}
        >
          <CustomTooltip title={'Editar'}>
            <CustomButton
              type={'link'}
              icon={<EditOutlined />}
              onClick={() => onEdit(record.STAFF_ID)}
            />
          </CustomTooltip>
          <CustomTooltip title={value === 'A' ? 'Inhabilitar' : 'Habilitar'}>
            <CustomButton
              danger={value === 'A'}
              type={'link'}
              icon={<DeleteOutlined />}
              onClick={() => handleUpdate(record)}
            />
          </CustomTooltip>
        </CustomSpace>
      ),
    },
  ]

  return (
    <CustomTable
      dataSource={staffList}
      columns={columns}
      pagination={getTablePagination(metadata)}
      onChange={onChange}
    />
  )
}

export default EmployeesTable
