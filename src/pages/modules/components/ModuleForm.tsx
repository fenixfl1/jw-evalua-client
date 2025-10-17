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
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useCreateModuleMutation } from 'src/services/work_modules/useCreateModuleMutation'
import { WorkModule } from 'src/services/work_modules/module.types'
import { useCreateOrUpdateModuleMemberMutation } from 'src/services/work_modules/useCreateOrUpdateModuleMemberMutation'
import { TransferKey } from 'antd/lib/transfer/interface'
import { TransferDirection } from 'antd/lib/transfer'
import { useUpdateModuleMutation } from 'src/services/work_modules/useUpdateModuleMutation'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'

interface ModuleFormProps {
  open: boolean
  onClose?: () => void
  record?: WorkModule
}

const ModuleForm: React.FC<ModuleFormProps> = ({ record, open, onClose }) => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const withoutModule = Form.useWatch('WITHOUT_MODULE', form) ?? true
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([])
  const [searchUserKey, setSearchKeyUser] = useState('')

  const debounceUser = useDebounce(searchUserKey)

  const { staffList } = useStaffStore()
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
        value: true,
        field: 'USER_ID',
        operator: 'IS NULL',
      },
    ]

    getStaff({ page: 1, size: 200, condition })
  }, [])

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

  const availableStaff = useMemo(() => {
    if (!withoutModule) {
      return staffList
    }

    return staffList.filter((staff) => {
      if (staff.MODULE_ID == null) {
        return true
      }
      if (!isEditing) {
        return false
      }

      return staff.MODULE_ID === record?.MODULE_ID
    })
  }, [staffList, withoutModule, isEditing, record?.MODULE_ID])

  const dataSource: TransferData[] = useMemo(() => {
    const map = new Map<string, TransferData>()

    availableStaff.forEach((staff) => {
      const key = staff.STAFF_ID?.toString()

      if (!key) {
        return
      }

      map.set(key, {
        chosen: targetKeys?.includes(key) ?? false,
        key,
        description: staff?.['FILTER'] ?? '',
        title: `${staff.NAME} ${staff.LAST_NAME}`,
        moduleId: staff.MODULE_ID != null ? String(staff.MODULE_ID) : undefined,
      })
    })

    if (isEditing) {
      record?.MEMBERS?.forEach((member) => {
        const key = member.STAFF_ID?.toString()
        if (!key || map.has(key)) {
          return
        }

        map.set(key, {
          chosen: targetKeys?.includes(key) ?? false,
          key,
          description: '',
          title: `${member.NAME} ${member.LAST_NAME}`,
          moduleId:
            record?.MODULE_ID != null ? String(record.MODULE_ID) : undefined,
        })
      })
    }

    return Array.from(map.values())
  }, [
    availableStaff,
    isEditing,
    record?.MEMBERS,
    record?.MODULE_ID,
    targetKeys,
  ])

  const filterTransferOption = useCallback<
    NonNullable<TransferProps['filterOption']>
  >(
    (inputValue, option) => {
      const search = inputValue.trim().toLowerCase()
      if (!search) {
        return true
      }

      const item = option as TransferData
      const title = item.title?.toLowerCase?.() ?? ''
      const description = item.description?.toLowerCase?.() ?? ''

      if (title.includes(search) || description.includes(search)) {
        return true
      }

      const isInLeftList = !(targetKeys ?? []).includes(item.key)
      if (!isInLeftList) {
        return false
      }

      return item.moduleId?.toLowerCase?.().includes(search) ?? false
    },
    [targetKeys]
  )

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()
      let message = ''

      delete data.WITHOUT_MODULE

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
    form.setFieldsValue({ MEMBERS: value })
  }

  const handleChangeMember = async (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[]
  ) => {
    try {
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
      width={'550px'}
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
                  filterOption={filterTransferOption}
                  titles={[
                    <CustomFormItem
                      initialValue={true}
                      name={'WITHOUT_MODULE'}
                      valuePropName="checked"
                      getValueFromEvent={(event) => {
                        if (event.target) {
                          return event.target.checked
                        }

                        return event
                      }}
                    >
                      <CustomCheckbox checked={withoutModule}>
                        Sin módulo
                      </CustomCheckbox>
                    </CustomFormItem>,
                  ]}
                  dataSource={dataSource}
                  targetKeys={targetKeys}
                  onChange={handleChangeMember}
                  onSearch={handleTransferSearch}
                  pagination={{
                    pageSize: 7,
                    showSizeChanger: true,
                  }}
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
