import { App, Form } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import useDebounce from 'src/hooks/use-debounce'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useAssignGoalToModuleMutation } from 'src/services/goals/useAssignGoalToModuleMutation'
import { useGetGoalPaginationMutation } from 'src/services/goals/useGetGoalPaginationMutation'
import { usePostGoalProgressMutation } from 'src/services/goals/usePostGoalProgressMutation'
import { WorkModule } from 'src/services/work_modules/module.types'
import { useGoalStore } from 'src/store/goal.store'
import { AdvancedCondition } from 'src/types/general'

interface GoalActionsProps {
  module: WorkModule
  onFinish?: () => void
}

const GoalActions: React.FC<GoalActionsProps> = ({ module, onFinish }) => {
  const { message } = App.useApp()
  const [searchParams] = useSearchParams()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()

  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { mutateAsync: assignGoal, isPending: isAssigning } =
    useAssignGoalToModuleMutation()
  const { mutateAsync: postProgress, isPending: isPosting } =
    usePostGoalProgressMutation()
  const { mutate: getGoals } = useGetGoalPaginationMutation()

  const { goals, goalMetadata: metadata } = useGoalStore()

  const [periodOptions, currentPeriod] = useGetPeriods()

  const handleGetGoals = useCallback(() => {
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
        field: 'FILTER',
        operator: 'LIKE',
      })
    }

    getGoals({ condition, page: metadata.currentPage, size: metadata.pageSize })
  }, [debounce])

  useEffect(handleGetGoals, [handleGetGoals])

  useEffect(() => {
    form.setFieldValue(
      ['MODULE', 'MODULE_ID'],
      searchParams.get('moduleId') ?? module?.MODULE_ID
    )
    form.setFieldValue(
      ['PROGRESS', 'MODULE_ID'],
      searchParams.get('moduleId') ?? module?.MODULE_ID
    )
  }, [searchParams])

  return (
    <CustomCol xs={24}>
      <CustomCollapse
        defaultActiveKey={[1]}
        items={[
          {
            key: 1,
            label: 'Acciones',
            children: (
              <CustomSpace wrap>
                <CustomForm form={form} layout={'inline'}>
                  <CustomFormItem
                    hidden
                    name={['MODULE', 'MODULE_ID']}
                    noStyle
                  />
                  <CustomFormItem
                    name={['MODULE', 'GOAL_ID']}
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      style={{ width: 260 }}
                      placeholder={'Selecciona meta'}
                      onSearch={setSearchKey}
                      options={goals.map((g) => ({
                        value: g.GOAL_ID,
                        label: `${g.GOAL_ID} - ${g.DESCRIPTION}`,
                      }))}
                    />
                  </CustomFormItem>
                  <CustomFormItem
                    name={['MODULE', 'PERIOD']}
                    initialValue={currentPeriod}
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      style={{ width: 220 }}
                      placeholder="Periodo (YYYYWW)"
                      options={periodOptions}
                    />
                  </CustomFormItem>
                  <CustomFormItem
                    name={['MODULE', 'TARGET_VALUE']}
                    rules={[{ required: true }]}
                  >
                    <CustomInputNumber min={1} placeholder={'Objetivo'} />
                  </CustomFormItem>
                  <CustomFormItem>
                    <CustomButton
                      loading={isAssigning}
                      onClick={async () => {
                        try {
                          const { MODULE: values } = await form.validateFields()
                          await assignGoal({
                            ...values,
                          })
                          message.success('Asignación registrada')
                          form.resetFields(['MODULE'])
                          onFinish?.()
                        } catch (error) {
                          errorHandler(error)
                        }
                      }}
                    >
                      Asignar al módulo
                    </CustomButton>
                  </CustomFormItem>
                </CustomForm>

                <CustomDivider />

                <CustomForm
                  layout={'inline'}
                  onFinish={async ({ PROGRESS: values }) => {
                    try {
                      await postProgress(values)
                      message.success('Progreso registrado')
                      form.resetFields(['PROGRESS'])
                      onFinish?.()
                    } catch (error) {
                      errorHandler(error)
                    }
                  }}
                >
                  <CustomFormItem
                    hidden
                    uppercase={false}
                    name={['PROGRESS', 'SCOPE']}
                    initialValue={'module'}
                    noStyle
                  />
                  <CustomFormItem
                    hidden
                    name={['PROGRESS', 'MODULE_ID']}
                    initialValue={module.MODULE_ID}
                    noStyle
                  />
                  <CustomFormItem
                    name={['PROGRESS', 'GOAL_ID']}
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      style={{ width: 260 }}
                      placeholder={'Meta'}
                      onSearch={setSearchKey}
                      options={goals.map((g) => ({
                        value: g.GOAL_ID,
                        label: `${g.GOAL_ID} - ${g.DESCRIPTION}`,
                      }))}
                    />
                  </CustomFormItem>
                  <CustomFormItem
                    name={['PROGRESS', 'PERIOD']}
                    initialValue={currentPeriod}
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      style={{ width: 220 }}
                      placeholder="Periodo (YYYYWW)"
                      options={periodOptions}
                    />
                  </CustomFormItem>
                  <CustomFormItem
                    name={['PROGRESS', 'ACTUAL_VALUE']}
                    rules={[{ required: true }]}
                  >
                    <CustomInputNumber placeholder="Real" />
                  </CustomFormItem>
                  {/* <CustomFormItem
                    name={'SCOPE'}
                    // label={'Alcance'}
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      placeholder={'Seleccionar alcance'}
                      options={[
                        { label: 'Modulo', value: 'module' },
                        { label: 'Individual', value: 'individual' },
                      ]}
                    />
                  </CustomFormItem> */}
                  <CustomFormItem>
                    <CustomButton htmlType="submit" loading={isPosting}>
                      Registrar progreso
                    </CustomButton>
                  </CustomFormItem>
                </CustomForm>
              </CustomSpace>
            ),
          },
        ]}
      />
    </CustomCol>
  )
}

export default GoalActions
