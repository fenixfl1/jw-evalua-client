import React from 'react'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import CustomCollapseFormList from '../../../components/custom/CustomCollapseFormList'
import { Form, FormInstance } from 'antd'
import { labelColFullWidth } from 'src/config/breakpoints'
import CustomCard from '../../../components/custom/CustomCard'
import { QuestionCircleOutlined } from '@ant-design/icons'
import CustomTooltip from '../../../components/custom/CustomTooltip'
import ConditionalComponent from 'src/components/ConditionalComponent'

interface GoalTasksFormProps {
  form: FormInstance
  name?: (string | number)[]
  staffOptions?: { value: number; label: string }[]
}

const GoalTasksForm: React.FC<GoalTasksFormProps> = ({
  form,
  name = ['TASKS'],
  staffOptions,
}) => {
  const tasks = Form.useWatch(name, form)

  return (
    <CustomCol xs={24}>
      <CustomFormItem label={' '} colon={false} {...labelColFullWidth}>
        <CustomCollapseFormList
          addText={'Agregar Tarea'}
          form={form}
          name={name}
          itemLabel={(index) => tasks?.[index]?.DESCRIPTION ?? ''}
        >
          {(field) => (
            <CustomSpace
              direction="vertical"
              size={16}
              style={{ width: '100%' }}
            >
              <CustomRow gutter={[12, 12]}>
                <CustomCol xs={24} md={12}>
                  <CustomFormItem
                    name={[field.name, 'DESCRIPTION']}
                    rules={[
                      {
                        required: true,
                        message: 'Ingresa la descripción de la tarea.',
                      },
                    ]}
                  >
                    <CustomInput placeholder="Descripción" />
                  </CustomFormItem>
                </CustomCol>

                <CustomCol xs={24} md={12}>
                  <CustomSpace direction={'horizontal'}>
                    <CustomFormItem
                      name={[field.name, 'TARGET']}
                      rules={[
                        {
                          required: true,
                          message: 'Ingresa el objetivo de la tarea.',
                        },
                      ]}
                    >
                      <CustomInputNumber
                        min={1}
                        step={1}
                        precision={0}
                        placeholder="Objetivo"
                      />
                    </CustomFormItem>

                    <CustomRow align={'middle'} height={'max-content'} gap={4}>
                      <CustomFormItem
                        name={[field.name, 'UNITS_PER_ITEM']}
                        rules={[
                          {
                            required: true,
                            message:
                              'Ingresa cuántas unidades aporta esta tarea por prenda.',
                          },
                        ]}
                      >
                        <CustomInputNumber
                          min={0.01}
                          step={0.01}
                          precision={2}
                          placeholder="Unidades por prenda"
                        />
                      </CustomFormItem>
                      <CustomFormItem>
                        <CustomTooltip
                          title={
                            'Indica la cantidad por unidad. Ejemplo par una camiseta se necesitan unir dos mangas.'
                          }
                        >
                          <QuestionCircleOutlined
                            style={{ color: '#40a9ff', cursor: 'help' }}
                          />
                        </CustomTooltip>
                      </CustomFormItem>
                    </CustomRow>
                  </CustomSpace>
                </CustomCol>
                <CustomCol xs={24}>
                  <CustomFormItem name={[field.name, 'COMMENT']}>
                    <CustomTextArea
                      placeholder="Comentario (opcional)"
                      rows={2}
                      maxLength={500}
                    />
                  </CustomFormItem>
                </CustomCol>
              </CustomRow>

              <ConditionalComponent condition={!!staffOptions}>
                <>
                  <CustomDivider plain>Asignación de operadores</CustomDivider>
                  <CustomCard>
                    <CustomCollapseFormList
                      addButtonPosition={'bottom'}
                      addText={'Agregar Operador'}
                      form={form}
                      initialValue={[{}]}
                      name={[field.name, 'STAFF']}
                      sort={'desc'}
                      itemLabel={(index) =>
                        staffOptions?.find(
                          (staff) =>
                            staff.value ===
                            tasks?.[field.name]?.STAFF?.[index]?.STAFF_ID
                        )?.label ?? ''
                      }
                    >
                      {(staffField) => (
                        <CustomRow
                          key={staffField.key}
                          gutter={[12, 12]}
                          align="middle"
                        >
                          <CustomCol xs={24} md={12}>
                            <CustomFormItem
                              name={[staffField.name, 'STAFF_ID']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Selecciona un operador.',
                                },
                              ]}
                            >
                              <CustomSelect
                                placeholder="Operador"
                                options={staffOptions}
                                disabled={!staffOptions.length}
                                showSearch
                                optionFilterProp="label"
                              />
                            </CustomFormItem>
                          </CustomCol>
                          <CustomCol xs={20} md={10}>
                            <CustomFormItem
                              name={[staffField.name, 'TARGET']}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    'Ingresa el objetivo asignado al operador.',
                                },
                              ]}
                            >
                              <CustomInputNumber
                                min={1}
                                step={1}
                                precision={0}
                                placeholder="Objetivo individual"
                              />
                            </CustomFormItem>
                          </CustomCol>
                        </CustomRow>
                      )}
                    </CustomCollapseFormList>
                  </CustomCard>
                </>
              </ConditionalComponent>
            </CustomSpace>
          )}
        </CustomCollapseFormList>
      </CustomFormItem>
    </CustomCol>
  )
}

export default GoalTasksForm
