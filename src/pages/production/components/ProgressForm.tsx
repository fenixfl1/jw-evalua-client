import { App, Form } from 'antd'
import React, { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomSpace from 'src/components/custom/CustomSpace'
import { CustomText } from 'src/components/custom/CustomParagraph'
import PeriodSelector from 'src/components/PeriodSelector'
import { defaultBreakpoints, formItemLayout } from 'src/config/breakpoints'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useGetModuleGoalsQuery } from 'src/services/goals/useGetModuleGoalsQuery'
import CustomFormList from 'src/components/custom/CustomFormList'
import ConditionalComponent from 'src/components/ConditionalComponent'
import styled from 'styled-components'
import { useGetGoalTasksDetailQuery } from 'src/services/goals/useGetGoalTasksDetailQuery'
import { useRegisterOperatorCompletionMutation } from 'src/services/operators/useRegisterOperatorCompletionMutation'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomTag from 'src/components/custom/CustomTag'

interface StaffTaskContribution {
  STAFF_ID: number
  STAFF_NAME?: string
  UNITS?: number | null
  TIME?: number | null
}

interface TaskContributionFormValue {
  GOAL_TASK_ID: number
  DESCRIPTION?: string
  TARGET?: number
  COMPLETED_UNITS?: number
  CONTRIBUTIONS?: StaffTaskContribution[]
  UNITS_PER_ITEM?: number
}

interface ProgressFormValues {
  PERIOD?: number
  GOAL_ID?: number
  TASKS?: TaskContributionFormValue[]
}

interface ProgressFormProps {
  open: boolean
  onCancel?: () => void
}

const ProgressForm: React.FC<ProgressFormProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [searchParams] = useSearchParams()
  const [taskFormValues, setTaskFormValues] = React.useState<
    TaskContributionFormValue[]
  >([])
  const [periodValue, setPeriodValue] = React.useState<number | undefined>()
  const [selectedGoalId, setSelectedGoalId] = React.useState<
    number | undefined
  >(undefined)

  const moduleId = searchParams.get('moduleId')
  const parsedModuleId = moduleId ? Number(moduleId) : undefined

  const [, currentPeriod] = useGetPeriods()

  const { data: goalModules } = useGetModuleGoalsQuery(
    parsedModuleId,
    periodValue
  )
  const {
    data: taskDetail,
    isFetching: isFetchingTasks,
    refetch: refetchTasks,
  } = useGetGoalTasksDetailQuery(
    parsedModuleId,
    periodValue,
    selectedGoalId
  )
  const { mutateAsync: registerCompletion, isPending: isRegistering } =
    useRegisterOperatorCompletionMutation()

  const handleRefreshTasks = useCallback(() => {
    if (!parsedModuleId || !periodValue || !selectedGoalId) return
    refetchTasks()
  }, [parsedModuleId, periodValue, selectedGoalId, refetchTasks])

  useEffect(handleRefreshTasks, [handleRefreshTasks])

  useEffect(() => {
    const currentFormPeriod = form.getFieldValue('PERIOD')
    if (typeof currentFormPeriod === 'number') {
      setPeriodValue(currentFormPeriod)
      return
    }

    if (currentPeriod) {
      form.setFieldValue('PERIOD', currentPeriod)
      setPeriodValue(currentPeriod)
    }
  }, [currentPeriod, form])

  useEffect(() => {
    if (!parsedModuleId) return
    form.setFieldValue('MODULE_ID', parsedModuleId)
    form.setFieldValue('SCOPE', 'module')
  }, [form, parsedModuleId])

  useEffect(() => {
    if (!taskDetail?.length) {
      form.setFieldValue('TASKS', [])
      setTaskFormValues([])
      return
    }

    const mapped = taskDetail.map((task) => ({
      GOAL_TASK_ID: task.goalTaskId,
      DESCRIPTION: task.description,
      TARGET: task.target,
      COMPLETED_UNITS: task.completedUnits,
      UNITS_PER_ITEM: task.unitsPerItem ?? 1,
      CONTRIBUTIONS: (task.assignees ?? []).map((assignee) => ({
        STAFF_ID: assignee.staffId,
        STAFF_NAME: assignee.staffName,
        UNITS: null,
        TIME: null,
      })),
    }))

    form.setFieldValue('TASKS', mapped)
    setTaskFormValues(mapped)
  }, [taskDetail, form])

  const hasTasks = Array.isArray(taskFormValues) && taskFormValues.length > 0

  const handleValuesChange = useCallback(
    (_: unknown, allValues: ProgressFormValues = {}) => {
      const nextTasks = Array.isArray(allValues?.TASKS) ? allValues.TASKS : []
      setTaskFormValues(nextTasks)

      setPeriodValue(
        typeof allValues?.PERIOD === 'number' ? allValues.PERIOD : undefined
      )

      setSelectedGoalId(
        typeof allValues?.GOAL_ID === 'number'
          ? allValues.GOAL_ID
          : undefined
      )
    },
    []
  )

  const getTaskContributionTotal = useCallback(
    (task?: TaskContributionFormValue) => {
      if (!task?.CONTRIBUTIONS?.length) return 0
      return task.CONTRIBUTIONS.reduce((acc, contribution) => {
        const units = Number(contribution?.UNITS ?? 0)
        return acc + (Number.isFinite(units) ? units : 0)
      }, 0)
    },
    []
  )

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const selectedPeriodValue = Number(values.PERIOD ?? periodValue)

      if (!parsedModuleId || !selectedPeriodValue || !selectedGoalId) {
        message.warning('Selecciona el módulo, período y meta.')
        return
      }

      const tasks = (values?.TASKS as TaskContributionFormValue[]) ?? []
      const operations: Promise<unknown>[] = []

      tasks.forEach((task) => {
        task.CONTRIBUTIONS?.forEach((contribution) => {
          const units = Number(contribution?.UNITS ?? 0)
          if (units > 0 && task.GOAL_TASK_ID && contribution.STAFF_ID) {
            operations.push(
              registerCompletion({
                taskId: task.GOAL_TASK_ID,
                timestamp: new Date().toISOString(),
                units,
                staffId: contribution.STAFF_ID,
                metadata: {
                  source: 'supervisor-form',
                  reportedUnits: units,
                  timeMinutes: contribution.TIME ?? null,
                },
              })
            )
          }
        })
      })

      if (!operations.length) {
        message.warning('Ingresa al menos un aporte.')
        return
      }

      await Promise.all(operations)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'goals',
            'summary',
            'module',
            parsedModuleId,
            selectedPeriodValue,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ['goals', 'get-module-summary'],
        }),
      ])

      await refetchTasks()

      message.success('Progreso registrado con éxito.')
      form.resetFields(['TASKS'])
      setTaskFormValues([])
      onCancel?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <CustomModal
      title={'Registrar Progreso'}
      width={'40%'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={'Registrar'}
      okButtonProps={{ loading: isRegistering }}
      destroyOnHidden
    >
      <CustomSpin spinning={isFetchingTasks || isRegistering}>
        <CustomForm
          form={form}
          onValuesChange={handleValuesChange}
          initialValues={{
            SCOPE: 'module',
            MODULE_ID: parsedModuleId,
            PERIOD: periodValue ?? currentPeriod,
            TASKS: [{}],
          }}
          {...formItemLayout}
        >
          <CustomFormItem name={'SCOPE'} hidden initialValue={'module'} />
          <CustomFormItem
            name={'MODULE_ID'}
            hidden
            initialValue={parsedModuleId}
          />
          <CustomRow justify={'start'}>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Periodo'}
                name={'PERIOD'}
                initialValue={currentPeriod}
                rules={[{ required: true }]}
              >
                <PeriodSelector />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Meta'}
                name={'GOAL_ID'}
                rules={[{ required: true }]}
                labelCol={{ span: 8 }}
              >
                <CustomSelect
                  placeholder={'Seleccionar Meta'}
                  options={goalModules?.map((goal) => ({
                    label: goal.DESCRIPTION,
                    value: goal.GOAL_ID,
                  }))}
                />
              </CustomFormItem>
            </CustomCol>
          </CustomRow>
          <CustomDivider>Tareas del módulo</CustomDivider>
          <ConditionalComponent
            condition={hasTasks}
            fallback={
              <CustomText type="secondary">
                Selecciona una meta para ver las tareas y registrar el avance.
              </CustomText>
            }
          >
            <CustomFormList name={'TASKS'} initialValue={[{}]}>
              {(taskFields) => {
                const items = taskFields.map((taskField) => {
                  const taskData = taskFormValues?.[taskField.name]
                  const contributionTotal = getTaskContributionTotal(taskData)
                  const remaining = Math.max(
                    Number(taskData?.TARGET ?? 0) -
                      Number(taskData?.COMPLETED_UNITS ?? 0),
                    0
                  )

                  return {
                    key: String(taskField.name),
                    label: (
                      <TaskHeader>
                        <span>{taskData?.DESCRIPTION ?? 'Tarea'}</span>
                        <CustomTag>
                          {taskData?.COMPLETED_UNITS ?? 0}/
                          {taskData?.TARGET ?? 0} unidades (
                          {taskData?.UNITS_PER_ITEM ?? 1} u/prenda)
                        </CustomTag>
                      </TaskHeader>
                    ),
                    children: (
                      <TaskPanel>
                        <TaskStats>
                          <span>
                            Objetivo: {taskData?.TARGET ?? 0} unidades (
                            {taskData?.UNITS_PER_ITEM ?? 1} u/prenda)
                          </span>
                          <span>
                            Registrado: {taskData?.COMPLETED_UNITS ?? 0}{' '}
                            unidades
                          </span>
                          <span>Restante: {remaining} unidades</span>
                          <span>
                            Nuevo aporte:&nbsp;
                            <strong>{contributionTotal}</strong> unidades
                          </span>
                        </TaskStats>
                        <CustomDivider />
                        <CustomFormList
                          name={[taskField.name, 'CONTRIBUTIONS']}
                        >
                          {(contributionFields) => (
                            <CustomSpace
                              direction="vertical"
                              style={{ width: '100%' }}
                              size={12}
                            >
                              {contributionFields.map((contributionField) => {
                                const contributionValue =
                                  taskData?.CONTRIBUTIONS?.[
                                    contributionField.name
                                  ]
                                return (
                                  <ContributionRow key={contributionField.key}>
                                    <strong>
                                      {contributionValue?.STAFF_NAME ??
                                        `Operador ${
                                          contributionValue?.STAFF_ID ?? ''
                                        }`}
                                    </strong>
                                    <CustomSpace size={12}>
                                      <CustomFormItem
                                        name={[contributionField.name, 'UNITS']}
                                        rules={[
                                          {
                                            type: 'number',
                                            min: 0,
                                            message:
                                              'Ingresa una cantidad válida.',
                                          },
                                        ]}
                                      >
                                        <CustomInputNumber
                                          min={0}
                                          precision={0}
                                          placeholder="Cantidad"
                                          style={{ width: 130 }}
                                        />
                                      </CustomFormItem>
                                      <CustomFormItem
                                        name={[contributionField.name, 'TIME']}
                                      >
                                        <CustomInputNumber
                                          min={0}
                                          precision={0}
                                          placeholder="Tiempo (min)"
                                          style={{ width: 130 }}
                                        />
                                      </CustomFormItem>
                                    </CustomSpace>
                                    <CustomFormItem
                                      hidden
                                      name={[
                                        contributionField.name,
                                        'STAFF_ID',
                                      ]}
                                      initialValue={contributionValue?.STAFF_ID}
                                    />
                                    <CustomFormItem
                                      hidden
                                      name={[
                                        contributionField.name,
                                        'STAFF_NAME',
                                      ]}
                                      initialValue={
                                        contributionValue?.STAFF_NAME
                                      }
                                    />
                                  </ContributionRow>
                                )
                              })}
                            </CustomSpace>
                          )}
                        </CustomFormList>
                        <SummaryRow
                          $exceeds={
                            contributionTotal > remaining && remaining > 0
                          }
                        >
                          Total nuevo aporte: {contributionTotal} unidades
                          {remaining > 0 && (
                            <span>
                              &nbsp;| Restante después de registrar:{' '}
                              {Math.max(remaining - contributionTotal, 0)}
                            </span>
                          )}
                          {remaining === 0 && contributionTotal > 0 && (
                            <span>&nbsp;(excede el objetivo)</span>
                          )}
                        </SummaryRow>
                        <CustomFormItem
                          name={[taskField.name, 'GOAL_TASK_ID']}
                          hidden
                        />
                      </TaskPanel>
                    ),
                  }
                })

                return (
                  <CustomCollapse
                    items={items}
                    accordion
                    expandIconPosition="left"
                  />
                )
              }}
            </CustomFormList>
          </ConditionalComponent>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default ProgressForm

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const TaskPanel = styled.div`
  padding: 8px 4px 4px;
`

const TaskStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  font-size: 0.9rem;
  color: ${({ theme }) => (theme?.isDark ? '#d6e4ff' : '#4b5563')};
`

const ContributionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-bottom: 1px solid
    ${({ theme }) => (theme?.isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0')};

  &:last-child {
    border-bottom: none;
  }
`

const SummaryRow = styled.div<{ $exceeds?: boolean }>`
  margin-top: 12px;
  font-weight: 500;
  color: ${({ $exceeds, theme }) =>
    $exceeds ? '#ff4d4f' : theme?.isDark ? '#d6e4ff' : '#334155'};
`
