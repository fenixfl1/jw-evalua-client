import { App, Form, TransferProps } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTransfer from 'src/components/custom/CustomTransfer'
import { formItemLayout, labelColFullWidth } from 'src/config/breakpoints'
import useDebounce from 'src/hooks/use-debounce'
import { useGetPaginatedStaffMutation } from '../../../services/staff/userGetPaginatedStaffMutation'
import { useStaffStore } from 'src/store/staff.store'
import { AdvancedCondition, TransferData } from 'src/types/general'
import { getTablePagination } from 'src/utils/table-pagination'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useCreateModuleMutation } from 'src/services/work_modules/useCreateModuleMutation'
import { WorkModule } from 'src/services/work_modules/module.types'
import { useCreateOrUpdateModuleMemberMutation } from 'src/services/work_modules/useCreateOrUpdateModuleMemberMutation'
import { TransferKey } from 'antd/lib/transfer/interface'
import { TransferDirection } from 'antd/lib/transfer'
import { useUpdateModuleMutation } from 'src/services/work_modules/useUpdateModuleMutation'

interface ModuleFormProps {
  open: boolean
  onClose?: () => void
  record?: WorkModule
}

const ModuleForm: React.FC<ModuleFormProps> = ({ record, open, onClose }) => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([])
  const [searchKey, setSearchKey] = useState('')
  const [searchUserKey, setSearchKeyUser] = useState('')

  const debounceStaff = useDebounce(searchKey)
  const debounceUser = useDebounce(searchUserKey)

  const { staffList, metadata: staffMetadata } = useStaffStore()
  const { userList } = useUserStore()

  const { mutateAsync: createOrUpdateMembers } =
    useCreateOrUpdateModuleMemberMutation()
  const { mutateAsync: updateModule, isPending: isUpdatePending } =
    useUpdateModuleMutation()
  const { mutate: getStaff } = useGetPaginatedStaffMutation()
  const { mutate: getUsers } = useGetUserPaginationMutation()
  const { mutateAsync: createModule, isPending: isCreateModulePending } =
    useCreateModuleMutation()

  const isEditing = !isNaN(record?.MODULE_ID)

  const handleSearchStaff = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
      {
        value: debounceStaff,
        field: 'FILTER',
        operator: 'LIKE',
      },
      {
        value: 'N',
        field: 'HAS_USER',
        operator: '=',
      },
    ]

    getStaff({ page: 1, size: 15, condition })
  }, [debounceStaff])

  const handleGetUser = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
      {
        value: debounceUser,
        field: 'FILTER',
        operator: 'LIKE',
      },
    ]
    getUsers({ page: 1, size: 15, condition })
  }, [debounceUser])

  useEffect(handleSearchStaff, [handleSearchStaff])
  useEffect(handleGetUser, [handleGetUser])

  useEffect(() => {
    if (!record?.MODULE_ID) return

    form.setFieldsValue({ ...record })
    setTargetKeys(record.MEMBERS?.map((m) => String(m.STAFF_ID)))
  }, [record])

  const dataSource: TransferData[] = useMemo(() => {
    return staffList.map(
      (staff): TransferData => ({
        chosen: targetKeys?.includes(staff.STAFF_ID),
        key: staff.STAFF_ID?.toString(),
        description: staff?.['FILTER'],
        title: `${staff.NAME} ${staff.LAST_NAME}`,
      })
    )
  }, [staffList, targetKeys])

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()
      let message = ''

      if (isEditing) {
        delete data.MEMBERS
        message = await updateModule(data)
      } else {
        message = await createModule(data)
      }

      notification.success({
        message: 'Operación Exitosa',
        description: message,
      })
      form.resetFields()
      onClose?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleClose = () => {
    modal.confirm({
      title: '¿Estás seguro de que quieres cerrar el formulario?',
      content: 'Los cambios no guardados se perderán.',
      onOk: onClose,
    })
  }

  const handleTransferSearch: TransferProps['onSearch'] = async (
    _dir,
    value
  ) => {
    setSearchKey(value)
    form.setFieldsValue({ MEMBERS: value })
  }

  const handleChangeMember = async (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[]
  ) => {
    try {
      // eslint-disable-next-line no-console
      console.log({ targetKeys, direction, moveKeys })
      if (isEditing) {
        await createOrUpdateMembers({
          MODULE_ID: record.MODULE_ID,
          MEMBERS: moveKeys.map((key) => ({
            STAFF_ID: Number(key),
            STATE: direction === 'left' ? 'I' : 'A',
          })),
        })
      }
      setTargetKeys(targetKeys)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <CustomModal
      title={'Formulario de Módulos'}
      open={open}
      onCancel={handleClose}
      onOk={handleFinish}
    >
      <CustomSpin spinning={isCreateModulePending || isUpdatePending}>
        <CustomDivider />
        <CustomForm form={form} {...formItemLayout}>
          <CustomFormItem hidden name={'MODULE_ID'} />
          <CustomRow justify={'start'}>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Nombre'}
                name={'DESCRIPTION'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomInput placeholder={'Nombre del Módulo'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Supervisor'}
                name={'SUPERVISOR_ID'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomSelect
                  showSearch
                  onSearch={setSearchKeyUser}
                  placeholder={'Seleccionar supervisor'}
                  options={userList.map((user) => ({
                    label: `${user.NAME} ${user.LAST_NAME} (@${user.USERNAME})`,
                    value: user.USER_ID,
                  }))}
                />
              </CustomFormItem>
            </CustomCol>
            <CustomDivider>
              <CustomTitle level={4}>Miembros del Módulo</CustomTitle>
            </CustomDivider>
            <CustomCol xs={24}>
              <CustomFormItem label={' '} colon={false} name={'MEMBERS'}>
                <CustomTransfer
                  dataSource={dataSource}
                  targetKeys={targetKeys}
                  onChange={handleChangeMember}
                  onSearch={handleTransferSearch}
                  pagination={getTablePagination(staffMetadata)}
                />
              </CustomFormItem>
            </CustomCol>
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default ModuleForm
