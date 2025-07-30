import React, { useCallback, useEffect, useState } from 'react'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomRow from 'src/components/custom/CustomRow'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomInput from 'src/components/custom/CustomInput'
import CustomModal from 'src/components/custom/CustomModal'
import { Form, Modal } from 'antd'
import { useGetPaginatedStaffMutation } from 'src/services/staff/userGetPaginatedStaffMutation'
import useDebounce from 'src/hooks/use-debounce'
import { AdvancedCondition } from 'src/types/general'
import { Staff } from 'src/services/staff/staff.types'
import { useStaffStore } from 'src/store/staff.store'
import { useGetRolePaginationMutation } from 'src/services/roles/useGetRolePaginationMutation'
import { Role } from 'src/services/roles/role.type'
import { useRoleStore } from 'src/store/role.store'
import { useCreateUserMutation } from 'src/services/users/useCreateUserMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import { errorHandler } from 'src/utils/error-handler'
import { useAppNotification } from 'src/context/NotificationContext'

interface UserFormProps {
  open?: boolean
  onClose?: () => void
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose }) => {
  const notification = useAppNotification()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm()
  const [searchKey, setSearchKey] = useState<string>('')
  const [searchRoleKey, setSearchRoleKey] = useState('')
  const debounce = useDebounce(searchKey)
  const debounceRole = useDebounce(searchRoleKey)

  const { staffList } = useStaffStore()
  const { roleList } = useRoleStore()

  const { mutateAsync: createUser, isPending: isCreateUserPending } =
    useCreateUserMutation()
  const { mutate: getStaffPagination, isPending: isGetStaffPending } =
    useGetPaginatedStaffMutation()
  const { mutate: getRoles, isPending: isGetRolesPending } =
    useGetRolePaginationMutation()

  const handleSearchRole = useCallback(() => {
    const condition: AdvancedCondition<Role>[] = [
      {
        value: 'A',
        operator: '=',
        field: 'STATE',
      },
    ]

    if (debounceRole) {
      condition.push({
        value: debounceRole,
        operator: 'LIKE',
        field: 'NAME',
      })
    }

    getRoles({ page: 1, size: 15, condition })
  }, [debounceRole])

  const handleSearch = useCallback(() => {
    const condition: AdvancedCondition<Staff>[] = [
      {
        value: 'A',
        operator: '=',
        field: 'STATE',
      },
    ]

    if (debounce) {
      condition.push({
        value: debounce,
        operator: 'LIKE',
        field: ['IDENTITY_DOCUMENT', 'NAME', 'LAST_NAME'],
      })
    }

    getStaffPagination({ page: 1, size: 15, condition })
  }, [debounce])

  useEffect(handleSearch, [handleSearch])
  useEffect(handleSearchRole, [handleSearchRole])

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()

      await createUser(data)
      notification({
        message: 'Operación exitosa',
        description:
          'Usuario creado exitosamente, se le ha enviado sus credenciales a su correo electrónico.',
      })
      form.resetFields()
      onClose?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleClose = () => {
    modal.confirm({
      onOk: onClose,
      title: 'Confirmación',
      content:
        'Sí cierra la ventana perderá cualquier información que halla introducido.',
    })
  }

  return (
    <>
      <CustomModal
        closable
        title={'Formulario de usuario'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <CustomSpin spinning={isCreateUserPending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow>
              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Empleado'}
                  name={'STAFF_ID'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomSelect
                    onSearch={setSearchKey}
                    loading={isGetStaffPending}
                    placeholder={'Seleccionar empleado'}
                    options={staffList.map((item) => ({
                      label: `${item.NAME} ${item.LAST_NAME}`,
                      value: item.STAFF_ID,
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>
              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Usuario'}
                  name={'USERNAME'}
                  noSpaces
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre de usuario'} />
                </CustomFormItem>
              </CustomCol>
              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Rol'}
                  name={'ROLE_ID'}
                  noSpaces
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    onSearch={setSearchRoleKey}
                    loading={isGetRolesPending}
                    placeholder={'Seleccionar Rol'}
                    options={roleList.map((item) => ({
                      label: item.NAME,
                      value: item.ROLE_ID,
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>
            </CustomRow>
          </CustomForm>
        </CustomSpin>
      </CustomModal>
      {contextHolder}
    </>
  )
}

export default UserForm
