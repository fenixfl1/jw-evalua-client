import { App, Form } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomFormList from 'src/components/custom/CustomFormList'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useCustomModal } from 'src/hooks/use-custom-modal'
import useDebounce from 'src/hooks/use-debounce'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useAssignGoalToModuleMutation } from 'src/services/goals/useAssignGoalToModuleMutation'
import { useGetGoalPaginationMutation } from 'src/services/goals/useGetGoalPaginationMutation'
import { useGoalStore } from 'src/store/goal.store'
import { useModuleStore } from 'src/store/module.store'
import { AdvancedCondition } from 'src/types/general'
import GoalTasksForm from 'src/pages/production/components/GoalTasksForm'
import { buildAssignmentTasksFromTemplates } from 'src/utils/taskTemplates'

interface AssignGoalProps {
  open: boolean
  onCancel?: () => void
}

const distributeTargets = (rawTotal: number, weights: number[]) => {
  const size = weights.length
  if (size <= 0) return []

  const total = Number.isFinite(rawTotal)
    ? Math.max(0, Math.round(rawTotal))
    : 0

  const normalizedWeights = weights.map((weight) =>
    Number.isFinite(weight) && weight > 0 ? weight : 0
  )
  const weightSum = normalizedWeights.reduce((acc, weight) => acc + weight, 0)

  if (weightSum === 0) {
    return Array.from({ length: size }, () => 0)
  }

  const rawShares = normalizedWeights.map(
    (weight) => (weight / weightSum) * total
  )
  const baseShares = rawShares.map((share) => Math.floor(share))
  let remainder = total - baseShares.reduce((acc, share) => acc + share, 0)

  const order = rawShares
    .map((share, index) => ({
      index,
      fraction: share - baseShares[index],
      weight: normalizedWeights[index],
    }))
    .sort((a, b) => {
      if (b.fraction === a.fraction) {
        if (b.weight === a.weight) {
          return a.index - b.index
        }
        return b.weight - a.weight
      }
      return b.fraction - a.fraction
    })

  for (let i = 0; i < order.length && remainder > 0; i++) {
    baseShares[order[i].index] += 1
    remainder -= 1
  }

  return baseShares
}

const WEEKDAY_TARGET_HOURS = 8
const SATURDAY_TARGET_HOURS = 4

const createDefaultTargetTime = (isSaturday: boolean): Dayjs =>
  dayjs('1970-01-01 00:00:00').add(
    isSaturday ? SATURDAY_TARGET_HOURS : WEEKDAY_TARGET_HOURS,
    'hour'
  )

const parseTargetTime = (value: unknown): Dayjs | undefined => {
  if (!value) return undefined

  if (dayjs.isDayjs(value)) {
    return value as Dayjs
  }

  if (typeof value === 'string') {
    const direct = dayjs(value)
    if (direct.isValid()) {
      return direct
    }

    const withDatePrefix = dayjs(`1970-01-01 ${value}`)
    if (withDatePrefix.isValid()) {
      return withDatePrefix
    }
  }

  return undefined
}

const toTargetTimeString = (value?: Dayjs): string | undefined =>
  value ? value.format('HH:mm:ss') : undefined

const toTargetTimeNumber = (value: Dayjs): number | undefined => {
  if (!value || !value.isValid()) return undefined

  const hours = value.hour()
  const minutes = value.minute()
  const seconds = value.second()

  const decimalHours = hours + minutes / 60 + seconds / 3600
  return Number(decimalHours.toFixed(2))
}

const AssignGoal: React.FC<AssignGoalProps> = ({ open, onCancel }) => {
  const [errorHandler] = useErrorHandler()
  const { confirmModal } = useCustomModal()
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const selectedPeriod = Form.useWatch('PERIOD', form)
  const selectedGoalId = Form.useWatch('GOAL_ID', form)
  const targetValue = Form.useWatch('TARGET_VALUE', form)
  const dailyTargets = Form.useWatch('DAILY_TARGETS', form)
  const moduleId = Form.useWatch('MODULE_ID', form)
  const tasks = Form.useWatch('TASKS', form)

  const autoFillDailyRef = useRef(false)
  const lastGoalIdRef = useRef<number | null>(null)
  const [autoFillSeed, setAutoFillSeed] = useState(0)

  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const [searchParams] = useSearchParams()
  const [periodOptions, currentPeriod] = useGetPeriods()
  const { goals } = useGoalStore()
  const { workModules } = useModuleStore()

  const { mutate: getGoals } = useGetGoalPaginationMutation()
  const { mutateAsync: assignGoal, isPending: isAssigning } =
    useAssignGoalToModuleMutation()

  const moduleMembers = useMemo(() => {
    const formModuleId = Number(moduleId ?? searchParams.get('moduleId'))
    if (!Number.isFinite(formModuleId)) {
      return []
    }
    const foundModule = workModules.find(
      (item) => item.MODULE_ID === formModuleId
    )
    return foundModule?.MEMBERS ?? []
  }, [moduleId, workModules, searchParams])

  const staffOptions = useMemo(
    () =>
      moduleMembers.map((member) => ({
        value: member.STAFF_ID,
        label: `${member.NAME ?? ''} ${member.LAST_NAME ?? ''}`.trim(),
      })),
    [moduleMembers]
  )

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
    return Array.from({ length: 6 }, (_, index) => {
      const current = start.add(index, 'day')
      const isSaturday = current.day() === 6
      return {
        label: current.format('ddd DD MMM'),
        date: current.format('YYYY-MM-DD'),
        weight: isSaturday ? 0.5 : 1,
        isSaturday,
      }
    })
  }, [selectedPeriod])

  const handleSearchGoals = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
      {
        value: moment().toISOString(),
        field: 'END_DATE',
        operator: '>=',
      },
    ]

    if (debounce) {
      condition.push({
        value: debounce,
        field: 'FILTER',
        operator: 'LIKE',
      })
    }

    getGoals({ condition, page: 1, size: 25 })
  }, [debounce, getGoals])

  useEffect(handleSearchGoals, [handleSearchGoals])

  useEffect(() => {
    if (!open) return
    const moduleValues = form.getFieldValue('MODULE') ?? {}
    const moduleIdParam = searchParams.get('moduleId') ?? undefined
    const updates: Record<string, unknown> = {}

    if (moduleIdParam && moduleValues.MODULE_ID !== moduleIdParam) {
      updates.MODULE_ID = moduleIdParam
    }

    if (
      currentPeriod &&
      Number(moduleValues.PERIOD ?? 0) !== Number(currentPeriod)
    ) {
      updates.PERIOD = currentPeriod
    }

    if (Object.keys(updates).length) {
      form.setFieldsValue({
        MODULE: {
          ...moduleValues,
          ...updates,
        },
      })
    }
  }, [open, searchParams, currentPeriod, form])

  useEffect(() => {
    if (!open) return
    const currentTasks = form.getFieldValue('TASKS')
    if (!Array.isArray(currentTasks) || !currentTasks.length) {
      form.setFieldsValue({ TASKS: [{ STAFF: [{}] }] })
    }
  }, [open, form])

  useEffect(() => {
    if (!selectedGoalId) {
      lastGoalIdRef.current = null
      return
    }

    const numericGoalId = Number(selectedGoalId)
    if (!Number.isFinite(numericGoalId)) {
      return
    }

    const selectedGoal = goals.find((goal) => goal.GOAL_ID === numericGoalId)
    if (!selectedGoal) {
      return
    }

    const currentTargetValue = Number(form.getFieldValue('TARGET_VALUE') ?? 0)
    const nextTargetValue = Math.max(
      0,
      Math.round(Number(selectedGoal.TARGET_VALUE ?? 0))
    )

    if (
      Number.isFinite(nextTargetValue) &&
      currentTargetValue !== nextTargetValue
    ) {
      form.setFieldValue('TARGET_VALUE', nextTargetValue)
    }

    if (lastGoalIdRef.current !== numericGoalId) {
      const templateTasks = buildAssignmentTasksFromTemplates(
        selectedGoal.TASK_TEMPLATES
      )
      form.setFieldsValue({
        TASKS: templateTasks.length ? templateTasks : [{ STAFF: [{}] }],
      })
      lastGoalIdRef.current = numericGoalId
    }
  }, [selectedGoalId, goals, form])

  useEffect(() => {
    if (!selectedPeriod || !weekDays.length) {
      return
    }

    const dailyTargetField = form.getFieldValue('DAILY_TARGETS')
    const existingRaw: {
      TARGET_DATE?: string
      TARGET_VALUE?: number
      TARGET_TIME?: Dayjs | string | null
    }[] = Array.isArray(dailyTargetField) ? dailyTargetField : []

    const existing = existingRaw.filter(Boolean)
    const numericTarget = Math.max(0, Math.round(Number(targetValue ?? 0)))
    const distribution = distributeTargets(
      numericTarget,
      weekDays.map((day) => Number(day.weight ?? 1))
    )

    const hasMismatchedDates =
      existing.length !== weekDays.length ||
      weekDays.some(
        (day) => !existing.some((item) => item?.TARGET_DATE === day.date)
      )

    const needsNormalization = existing.some(
      (item) => !Number.isFinite(Number(item?.TARGET_VALUE))
    )

    const shouldAutofillValues = autoFillDailyRef.current

    let shouldUpdate = hasMismatchedDates || needsNormalization

    const nextDaily = weekDays.map((day, index) => {
      const stored = existing.find((item) => item?.TARGET_DATE === day.date)
      const storedValue = Number(stored?.TARGET_VALUE)
      const hasStoredValue = Number.isFinite(storedValue)
      const storedTime = parseTargetTime(stored?.TARGET_TIME)
      const defaultTime = createDefaultTargetTime(Boolean(day.isSaturday))

      let computedValue = 0
      if (shouldAutofillValues) {
        computedValue = distribution[index] ?? 0
      } else if (hasStoredValue) {
        computedValue = storedValue
      }

      const computedTime =
        shouldAutofillValues || !storedTime ? defaultTime : storedTime

      const storedTimeString = toTargetTimeString(storedTime)
      const computedTimeString = toTargetTimeString(computedTime)

      if (
        stored?.TARGET_DATE !== day.date ||
        Number(stored?.TARGET_VALUE ?? 0) !== computedValue ||
        storedTimeString !== computedTimeString
      ) {
        shouldUpdate = true
      }

      return {
        TARGET_DATE: day.date,
        TARGET_VALUE: computedValue,
        TARGET_TIME: computedTime,
      }
    })

    if (shouldUpdate || shouldAutofillValues) {
      const nextValues = Array.isArray(dailyTargetField)
        ? { DAILY_TARGETS: nextDaily }
        : {
            ...(dailyTargetField ?? {}),
            DAILY_TARGETS: nextDaily,
          }

      form.setFieldsValue(nextValues)
    }

    if (autoFillDailyRef.current) {
      autoFillDailyRef.current = false
    }
  }, [form, selectedPeriod, weekDays, targetValue, autoFillSeed])

  const dailyTotal = useMemo(() => {
    if (!Array.isArray(dailyTargets)) return 0
    return dailyTargets.reduce((acc, item) => {
      const value = Number(item?.TARGET_VALUE ?? 0)
      return acc + (Number.isFinite(value) ? value : 0)
    }, 0)
  }, [dailyTargets])

  const taskTotal = useMemo(() => {
    if (!Array.isArray(tasks)) return 0
    return tasks.reduce((acc, task) => {
      const value = Number(task?.TARGET ?? 0)
      return acc + (Number.isFinite(value) ? value : 0)
    }, 0)
  }, [tasks])

  const handleAutoDistribute = () => {
    autoFillDailyRef.current = true
    setAutoFillSeed((seed) => seed + 1)
  }

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()

      if (!values) {
        throw new Error('Los datos del formulario no son validos.')
      }

      if (!staffOptions.length) {
        throw new Error(
          'El módulo seleccionado no tiene operadores activos para asignar tareas.'
        )
      }

      const nextDaily: {
        TARGET_DATE: string
        TARGET_VALUE: number
        TARGET_TIME?: string
      }[] = (
        values.DAILY_TARGETS?.filter((item) => item.TARGET_VALUE > 0) ?? []
      )
        .map(
          (item: {
            TARGET_DATE?: string
            TARGET_VALUE?: number
            TARGET_TIME?: Dayjs | string | null
          }) => {
            const parsedTime = parseTargetTime(item?.TARGET_TIME)
            return {
              TARGET_DATE: item?.TARGET_DATE ?? '',
              TARGET_VALUE: Number(item?.TARGET_VALUE ?? 0),
              ...(parsedTime
                ? { TARGET_TIME: toTargetTimeNumber(parsedTime) }
                : {}),
            }
          }
        )
        .filter((item) => Boolean(item.TARGET_DATE))

      const totalTarget = Number(values.TARGET_VALUE ?? 0)
      const sumDaily = nextDaily.reduce(
        (acc, item) => acc + Number(item.TARGET_VALUE ?? 0),
        0
      )

      if (nextDaily.length && totalTarget !== sumDaily) {
        throw new Error(
          'La suma de los objetivos diarios debe coincidir con el objetivo total.'
        )
      }

      const sanitizedTasks =
        (values.TASKS ?? []).map(
          (task: {
            DESCRIPTION?: string
            COMMENT?: string
            TARGET?: number
            UNITS_PER_ITEM?: number
            STAFF?: { STAFF_ID?: number; TARGET?: number }[]
          }) => ({
            DESCRIPTION: String(task.DESCRIPTION ?? '').trim(),
            COMMENT: task.COMMENT ? String(task.COMMENT).trim() : undefined,
            TARGET: Number(task.TARGET ?? 0),
            UNITS_PER_ITEM:
              Number(task.UNITS_PER_ITEM ?? 1) > 0
                ? Number(task.UNITS_PER_ITEM ?? 1)
                : 1,
            STAFF:
              task.STAFF?.map((member) => ({
                STAFF_ID: Number(member.STAFF_ID),
                TARGET: Number(member.TARGET ?? 0),
              })) ?? [],
          })
        ) ?? []

      if (!sanitizedTasks.length) {
        throw new Error('Debes registrar al menos una tarea para la meta.')
      }

      await assignGoal({
        GOAL_ID: Number(values.GOAL_ID ?? 0),
        MODULE_ID: Number(values.MODULE_ID ?? 0),
        TARGET_VALUE: totalTarget,
        PERIOD: Number(values.PERIOD ?? currentPeriod ?? 0),
        DAILY_TARGETS: nextDaily,
        TASKS: sanitizedTasks,
      })
      message.success('Meta y tareas asignadas con éxito.')
      form.resetFields()
      autoFillDailyRef.current = false
      setAutoFillSeed(0)
      onCancel?.()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleCancel = () => {
    confirmModal({
      title: 'Confirmación',
      onOk: onCancel,
      content:
        'Si cierras la ventana perderás cualquier información que hayas introducido. ¿Desea salir?',
    })
  }

  return (
    <CustomModal
      title={'Asignar Meta'}
      open={open}
      onCancel={handleCancel}
      onOk={handleFinish}
      width={'65%'}
    >
      <CustomSpin spinning={isAssigning}>
        <CustomForm form={form} {...formItemLayout}>
          <CustomRow justify={'start'}>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Periodo'}
                name={'PERIOD'}
                initialValue={currentPeriod}
                rules={[{ required: true }]}
              >
                <CustomSelect
                  placeholder="Periodo (YYYYWW)"
                  options={periodOptions}
                />
              </CustomFormItem>
            </CustomCol>
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Modulo'}
                name={'MODULE_ID'}
                initialValue={searchParams.get('moduleId')}
                rules={[{ required: true }]}
              >
                <CustomInput disabled />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Meta'}
                name={'GOAL_ID'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomSelect
                  placeholder={'Selecciona meta'}
                  onSearch={setSearchKey}
                  onSelect={(value) => {
                    const goal = goals.find((g) => g.GOAL_ID === value)
                    if (goal) {
                      form.setFieldValue(
                        'TARGET_VALUE',
                        Math.max(0, Math.round(Number(goal.TARGET_VALUE ?? 0)))
                      )
                    }
                  }}
                  options={goals.map((g) => ({
                    value: g.GOAL_ID,
                    label: `${g.GOAL_ID} - ${g.DESCRIPTION}`,
                  }))}
                />
              </CustomFormItem>
            </CustomCol>
            <CustomCol xs={24}>
              <CustomFormItem
                label={'Objetivo'}
                rules={[{ required: true }]}
                {...labelColFullWidth}
              >
                <CustomSpace direction={'horizontal'}>
                  <CustomFormItem
                    name={'TARGET_VALUE'}
                    rules={[{ required: true }]}
                    noStyle
                  >
                    <CustomInputNumber
                      min={1}
                      step={1}
                      precision={0}
                      placeholder={'Objetivo'}
                    />
                  </CustomFormItem>
                  <CustomButton
                    htmlType="button"
                    onClick={handleAutoDistribute}
                  >
                    Distribución automática
                  </CustomButton>
                </CustomSpace>
              </CustomFormItem>
            </CustomCol>

            <CustomDivider>
              <CustomTitle level={5}>Objetivo Diario</CustomTitle>
            </CustomDivider>

            <CustomCol xs={24}>
              <CustomFormItem label={' '} colon={false} {...labelColFullWidth}>
                <CustomFormList name={'DAILY_TARGETS'}>
                  {(fields) => (
                    <CustomSpace direction={'horizontal'} wrap>
                      {fields.map((field, index) => {
                        const dayMeta = weekDays[index]
                        if (!dayMeta) return null

                        return (
                          <CustomSpace
                            key={field.key}
                            direction={'horizontal'}
                            width={'max-content'}
                            size={4}
                          >
                            <CustomFormItem>
                              <CustomInput
                                readOnly
                                tabIndex={-1}
                                variant={'filled'}
                                value={dayMeta.label}
                              />
                            </CustomFormItem>
                            <CustomFormItem
                              name={[field.name, 'TARGET_DATE']}
                              hidden
                            />
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
                            <CustomFormItem
                              name={[field.name, 'TARGET_TIME']}
                              rules={[{ required: true }]}
                            >
                              <CustomDatePicker
                                width={null}
                                placeholder={'Tiempo estimado'}
                                picker={'time'}
                                format={null}
                              />
                            </CustomFormItem>
                          </CustomSpace>
                        )
                      })}
                    </CustomSpace>
                  )}
                </CustomFormList>
              </CustomFormItem>
              <CustomText type="secondary">
                Total diario: {dailyTotal} / Objetivo semanal:{' '}
                {Number(targetValue ?? 0)}
              </CustomText>
            </CustomCol>

            <CustomDivider>
              <CustomTitle level={5}>Tareas</CustomTitle>
            </CustomDivider>
            <CustomCol xs={24}>
              <GoalTasksForm
                form={form}
                name={['TASKS']}
                staffOptions={staffOptions}
              />
              <CustomText type="secondary">
                Total por tareas: {taskTotal} / Objetivo semanal:{' '}
                {Number(targetValue ?? 0)}
              </CustomText>
            </CustomCol>
          </CustomRow>
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default AssignGoal
