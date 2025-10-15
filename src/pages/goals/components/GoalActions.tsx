import { App, Form } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapse from 'src/components/custom/CustomCollapse'
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
import { CustomText } from 'src/components/custom/CustomParagraph'

const distributeEvenly = (rawTotal: number, size: number) => {
  if (size <= 0) return []
  const total = Number.isFinite(rawTotal)
    ? Math.max(0, Math.round(rawTotal))
    : 0
  const base = Math.floor(total / size)
  const remainder = total - base * size

  return Array.from({ length: size }, (_, index) => {
    return base + (index < remainder ? 1 : 0)
  })
}

interface GoalActionsProps {
  module: WorkModule
  onFinish?: () => void
  shouldUpdate?: boolean
}

const GoalActions: React.FC<GoalActionsProps> = ({
  module,
  onFinish,
  shouldUpdate,
}) => {
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
  const selectedPeriod = Form.useWatch(['MODULE', 'PERIOD'], form)
  const targetValue = Form.useWatch(['MODULE', 'TARGET_VALUE'], form)
  const dailyTargets = Form.useWatch(['MODULE', 'DAILY_TARGETS'], form)
  const selectedGoalId = Form.useWatch(['MODULE', 'GOAL_ID'], form)

  const autoFillDailyRef = useRef(false)
  const lastGoalIdRef = useRef<number | null>(null)

  const getIsoWeekStart = (period: number) => {
    const year = Math.floor(period / 100)
    const week = period % 100

    const simple = new Date(year, 0, 1 + (week - 1) * 7)
    const dayOfWeek = simple.getDay() === 0 ? 7 : simple.getDay()

    if (dayOfWeek <= 4) {
      simple.setDate(simple.getDate() - dayOfWeek + 1)
    } else {
      simple.setDate(simple.getDate() + 8 - dayOfWeek)
    }

    return dayjs(simple)
  }

  const weekDays = useMemo(() => {
    if (!selectedPeriod) return []
    const start = getIsoWeekStart(Number(selectedPeriod))
    return Array.from({ length: 7 }, (_, index) => {
      const current = start.add(index, 'day')
      return {
        label: current.format('ddd DD MMM'),
        date: current.format('YYYY-MM-DD'),
      }
    })
  }, [selectedPeriod])

  useEffect(() => {
    if (!selectedPeriod || !weekDays.length) {
      return
    }

    const moduleValues = form.getFieldValue('MODULE') ?? {}
    const existingRaw: { TARGET_DATE?: string; TARGET_VALUE?: number }[] =
      Array.isArray(moduleValues.DAILY_TARGETS)
        ? moduleValues.DAILY_TARGETS
        : []

    const existing = existingRaw.filter(Boolean)
    const numericTarget = Math.max(
      0,
      Math.round(Number(targetValue ?? 0))
    )
    const distribution = distributeEvenly(numericTarget, weekDays.length)

    const hasMismatchedDates =
      existing.length !== weekDays.length ||
      weekDays.some(
        (day) => !existing.some((item) => item?.TARGET_DATE === day.date)
      )

    const hasValues = existing.some((item) =>
      Number.isFinite(Number(item?.TARGET_VALUE))
    )

    const needsNormalization = existing.some(
      (item) => !Number.isFinite(Number(item?.TARGET_VALUE))
    )

    const shouldAutofillValues =
      autoFillDailyRef.current || hasMismatchedDates || !hasValues || numericTarget === 0

    let shouldUpdate = hasMismatchedDates || needsNormalization || shouldAutofillValues

    const nextDaily = weekDays.map((day, index) => {
      const stored = existing.find((item) => item?.TARGET_DATE === day.date)
      let computedValue = 0

      if (shouldAutofillValues) {
        computedValue = distribution[index] ?? 0
      } else if (Number.isFinite(Number(stored?.TARGET_VALUE))) {
        computedValue = Number(stored?.TARGET_VALUE)
      }

      if (
        stored?.TARGET_DATE !== day.date ||
        Number(stored?.TARGET_VALUE ?? 0) !== computedValue
      ) {
        shouldUpdate = true
      }

      return {
        TARGET_DATE: day.date,
        TARGET_VALUE: computedValue,
      }
    })

    if (shouldUpdate) {
      form.setFieldsValue({
        MODULE: {
          ...moduleValues,
          DAILY_TARGETS: nextDaily,
        },
      })
    }

    if (autoFillDailyRef.current) {
      autoFillDailyRef.current = false
    }
  }, [form, selectedPeriod, weekDays, targetValue])

  const dailyTotal = useMemo(() => {
    if (!Array.isArray(dailyTargets)) return 0
    return dailyTargets.reduce((acc, item) => {
      const value = Number(item?.TARGET_VALUE ?? 0)
      return acc + (Number.isFinite(value) ? value : 0)
    }, 0)
  }, [dailyTargets])

  useEffect(() => {
    if (!selectedGoalId) {
      lastGoalIdRef.current = null
      return
    }

    const numericGoalId = Number(selectedGoalId)
    if (!Number.isFinite(numericGoalId)) {
      return
    }

    const selectedGoal = goals.find(
      (goal) => goal.GOAL_ID === numericGoalId
    )

    if (!selectedGoal) {
      return
    }

    const moduleValues = form.getFieldValue('MODULE') ?? {}
    const currentTargetValue = Number(moduleValues?.TARGET_VALUE ?? 0)
    const nextTargetValue = Math.max(
      0,
      Math.round(Number(selectedGoal.TARGET_VALUE ?? 0))
    )

    const updates: Record<string, unknown> = {}
    if (
      Number.isFinite(nextTargetValue) &&
      currentTargetValue !== nextTargetValue
    ) {
      updates.TARGET_VALUE = nextTargetValue
    }

    if (Object.keys(updates).length) {
      form.setFieldsValue({
        MODULE: {
          ...moduleValues,
          ...updates,
        },
      })
    }

    if (lastGoalIdRef.current !== numericGoalId) {
      autoFillDailyRef.current = true
      lastGoalIdRef.current = numericGoalId
    }
  }, [selectedGoalId, goals, form])

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
  }, [debounce, shouldUpdate])

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
                    <CustomInputNumber
                      min={1}
                      step={1}
                      precision={0}
                      placeholder={'Objetivo entero'}
                    />
                  </CustomFormItem>
                  <CustomFormItem shouldUpdate noStyle>
                    {() =>
                      weekDays.length ? (
                        <CustomSpace direction="vertical" style={{ width: '100%' }}>
                          <CustomText strong>Objetivo diario</CustomText>
                          <Form.List name={['MODULE', 'DAILY_TARGETS']}>
                            {(fields) => (
                              <CustomSpace wrap>
                                {fields.map((field) => {
                                  const dayMeta = weekDays[field.name]
                                  if (!dayMeta) return null
                                  return (
                                    <CustomSpace
                                      key={field.key}
                                      direction="vertical"
                                      style={{ minWidth: 140 }}
                                      size={4}
                                    >
                                      <CustomText type="secondary">
                                        {dayMeta.label}
                                      </CustomText>
                                      <CustomFormItem
                                        name={[field.name, 'TARGET_DATE']}
                                        hidden
                                      >
                                        <input />
                                      </CustomFormItem>
                                      <CustomFormItem
                                        name={[field.name, 'TARGET_VALUE']}
                                        rules={[
                                          {
                                            required: true,
                                            message: 'Ingresa el objetivo diario',
                                          },
                                        ]}
                                      >
                                        <CustomInputNumber
                                          min={0}
                                          precision={0}
                                          placeholder="Cantidad"
                                        />
                                      </CustomFormItem>
                                    </CustomSpace>
                                  )
                                })}
                              </CustomSpace>
                            )}
                          </Form.List>
                          <CustomText type="secondary">
                            Total diario: {dailyTotal} / Objetivo semanal:{' '}
                            {Number(targetValue ?? 0)}
                          </CustomText>
                        </CustomSpace>
                      ) : null
                    }
                  </CustomFormItem>
                  <CustomFormItem>
                    <CustomButton
                      loading={isAssigning}
                      onClick={async () => {
                        try {
                          const { MODULE: values } = await form.validateFields()
                          const nextDaily: { TARGET_DATE: string; TARGET_VALUE: number }[] =
                            (values.DAILY_TARGETS ?? []).map(
                              (item: { TARGET_DATE: string; TARGET_VALUE: number }) => ({
                                TARGET_DATE: item.TARGET_DATE,
                                TARGET_VALUE: Number(item.TARGET_VALUE ?? 0),
                              })
                            )

                          const sumDaily = nextDaily.reduce(
                            (acc, item) => acc + Number(item.TARGET_VALUE ?? 0),
                            0
                          )

                          if (
                            nextDaily.length &&
                            Number(values.TARGET_VALUE ?? 0) !== sumDaily
                          ) {
                            message.warning(
                              'La suma de los objetivos diarios debe coincidir con el objetivo total.'
                            )
                            return
                          }

                          await assignGoal({
                            ...values,
                            DAILY_TARGETS: nextDaily,
                            TARGET_VALUE: Number(values.TARGET_VALUE ?? 0),
                            PERIOD: Number(values.PERIOD ?? currentPeriod),
                            MODULE_ID: Number(
                              values.MODULE_ID ?? module?.MODULE_ID ?? 0
                            ),
                          })
                          message.success(
                            'Asignación registrada y distribuida entre el equipo activo.'
                          )
                          form.resetFields([
                            ['MODULE', 'TARGET_VALUE'],
                            ['MODULE', 'GOAL_ID'],
                            ['MODULE', 'DAILY_TARGETS'],
                          ])
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

                <CustomForm
                  layout={'inline'}
                  onFinish={async ({ PROGRESS: values }) => {
                    try {
                      await postProgress(values)
                      message.success('Progreso registrado')
                      form.resetFields([
                        ['PROGRESS', 'GOAL_ID'],
                        ['PROGRESS', 'ACTUAL_VALUE'],
                      ])
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
