import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomRow from 'src/components/custom/CustomRow'
import { formItemLayout, labelColFullWidth } from 'src/config/breakpoints'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomModal from 'src/components/custom/CustomModal'
import { App, Form } from 'antd'
import CustomDivider from 'src/components/custom/CustomDivider'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import { useGetMenuOptionsWithPermissions } from 'src/services/menu-options/useGetMenuOptionsWithPermissionsMutation'
import useDebounce from 'src/hooks/use-debounce'
import CustomTree from 'src/components/custom/CustomTree'
import CustomSearch from 'src/components/custom/CustomSearch'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import { DataNode } from 'antd/lib/tree'
import { AdvancedCondition } from 'src/types/general'
import { errorHandler } from 'src/utils/error-handler'
import { useCreateRoleMutation } from 'src/services/roles/useCreateRoleMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import styled from 'styled-components'
import CustomCard from 'src/components/custom/CustomCard'
import { useRoleStore } from 'src/store/role.store'
import { useUpdateRoleMutation } from 'src/services/roles/useUpdateRoleMutation'
import queryClient from 'src/lib/query-client'

const Container = styled.div`
  max-height: 300px;
  width: 100%;
  overflow-y: auto;
`
interface RolesFormProps {
  open?: boolean
  onClose?: () => void
}

const RolesForm: React.FC<RolesFormProps> = ({ open, onClose }) => {
  const { notification } = App.useApp()
  const [form] = Form.useForm()
  const [checkedKeys, setCheckedKeys] = useState<number[]>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)
  const { mutate: getOptionsWithPermissions } =
    useGetMenuOptionsWithPermissions()
  const { mutateAsync: createRole, isPending: isCreatePending } =
    useCreateRoleMutation()
  const { mutateAsync: updateRole, isPending: isUpdatePending } =
    useUpdateRoleMutation()

  const { role } = useRoleStore()
  const { menuOptionsWithPermissions } = useMenuOptionStore()

  const handleSearchOptWithPerm = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
    ]

    if (debounce) {
      condition.push({
        value: debounce,
        field: 'NAME',
        operator: 'LIKE',
      })
    }

    getOptionsWithPermissions({ page: 1, size: 100, condition })
  }, [debounce])

  useEffect(handleSearchOptWithPerm, [handleSearchOptWithPerm])

  useEffect(() => {
    if (role?.ROLE_ID) {
      setCheckedKeys(role.PERMISSIONS)
      form.setFieldsValue({ ...role })
    }
  }, [role])

  const treeData: DataNode[] = useMemo(() => {
    if (!menuOptionsWithPermissions?.length) return []

    return menuOptionsWithPermissions.map((item) => ({
      title: item.NAME,
      key: item.MENU_OPTION_ID,
      children: item.PERMISSIONS.map((perm) => ({
        title: perm.DESCRIPTION,
        key: perm.PERMISSION_ID,
      })),
    }))
  }, [menuOptionsWithPermissions])

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()

      let description = 'Rol creado exitosamente'
      if (role?.ROLE_ID) {
        await updateRole({ ...data, ROLE_ID: role.ROLE_ID })
        description = `Rol '${role.ROLE_ID}' actualizado exitosamente.`
      } else {
        await createRole(data)
      }

      onClose?.()
      form.resetFields()
      queryClient.invalidateQueries({
        queryKey: ['get-one-role', role.ROLE_ID],
      })

      notification.success({
        message: 'Operación exitosa',
        description,
      })
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <CustomModal
      width={'40%'}
      closable
      title={'Formulario de Roles'}
      open={open}
      onCancel={onClose}
      onOk={handleFinish}
    >
      <CustomSpin spinning={isCreatePending || isUpdatePending}>
        <CustomDivider />
        <CustomForm form={form} {...formItemLayout}>
          <CustomRow justify={'start'}>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Nombre'}
                name={'NAME'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomInput placeholder={'Nombre del rol'} />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Descripción'}
                name={'DESCRIPTION'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomInput placeholder={'Descripción'} />
              </CustomFormItem>
            </CustomCol>
            <CustomDivider>
              <CustomTitle level={4}>Permisos</CustomTitle>
            </CustomDivider>
            <CustomCol xs={24}>
              <CustomFormItem label={'  '} colon={false} {...labelColFullWidth}>
                <CustomSearch
                  placeholder={'Buscar permisos...'}
                  onSearch={setSearchKey}
                  onChange={(event) => setSearchKey(event.target.value)}
                />
              </CustomFormItem>
            </CustomCol>
            <Container>
              <CustomFormItem label={' '} colon={false} {...labelColFullWidth}>
                <CustomCard>
                  <CustomCol xs={24}>
                    <CustomFormItem noStyle name={'PERMISSIONS'}>
                      <CustomTree
                        checkedKeys={checkedKeys}
                        treeData={treeData}
                        onCheck={(keys: React.Key[]) => {
                          setCheckedKeys(keys as number[])
                          form.setFieldsValue({
                            PERMISSIONS: keys.filter(
                              (key) => typeof key === 'number'
                            ),
                          })
                        }}
                      />
                    </CustomFormItem>
                  </CustomCol>
                </CustomCard>
              </CustomFormItem>
            </Container>
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default RolesForm
