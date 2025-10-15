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
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { User } from 'src/services/users/users.types'
import { useUpdateUserMutation } from 'src/services/users/useUpdateUserMutation'

interface UserFormProps {
  open?: boolean
  onClose?: () => void
  user?: User
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, user }) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
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
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUserMutation()

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        STAFF_ID: Number(user?.STAFF_ID),
        ROLE_ID: Number(user?.ROLE_ID),
      })
    }
  }, [user])

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

    if (user?.STAFF_ID) {
      condition.push({
        value: user.STAFF_ID,
        field: 'STAFF_ID',
        operator: '=',
      })
    } else {
      condition.push({
        value: true,
        field: 'USER_ID',
        operator: 'IS NULL',
      })
    }

    getStaffPagination({ page: 1, size: 15, condition })
  }, [debounce, user])

  useEffect(handleSearch, [handleSearch])
  useEffect(handleSearchRole, [handleSearchRole])

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()

      let description =
        'Usuario creado exitosamente, se le ha enviado sus credenciales a su correo electrónico.'
      if (user) {
        await updateUser({
          ROLE_ID: Number(data.ROLE_ID),
          USER_ID: user.USER_ID,
          USERNAME: user.USERNAME,
        })
        description = 'Usuario actualizado exitosamente.'
      } else {
        await createUser(data)
      }

      notification({
        message: 'Operación exitosa',
        description,
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
        <CustomSpin spinning={isCreateUserPending || isUpdatePending}>
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
                    disabled={!!user}
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
                  <CustomInput
                    disabled={!!user}
                    placeholder={'Nombre de usuario'}
                  />
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
