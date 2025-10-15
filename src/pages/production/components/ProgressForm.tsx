import { App, Form } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
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
import { usePostGoalProgressMutation } from 'src/services/goals/usePostGoalProgressMutation'
import type { Staff } from 'src/services/staff/staff.types'
import type { PostGoalProgressPayload } from 'src/services/goals/types'
import { useGetModuleMembersMutation } from 'src/services/work_modules/useGetModuleMembersMutation'
import { useModuleStore } from 'src/store/module.store'
import CustomFormList from 'src/components/custom/CustomFormList'
import CustomInput from 'src/components/custom/CustomInput'

interface StaffContribution {
  STAFF_ID: number
  STAFF_NAME?: string
  ACTUAL_VALUE?: number | null
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
  const period = Form.useWatch('PERIOD', form)
  const actualValue = Form.useWatch('ACTUAL_VALUE', form)
  const contributions = Form.useWatch('CONTRIBUTIONS', form) as
    | StaffContribution[]
    | undefined
  const [searchParams] = useSearchParams()

  const moduleId = searchParams.get('moduleId')
  const parsedModuleId = moduleId ? Number(moduleId) : undefined

  const [, currentPeriod] = useGetPeriods()

  const { data: goalModules } = useGetModuleGoalsQuery(parsedModuleId, period)
  const { mutate: getMembers, isPending: isGetMembersLoading } =
    useGetModuleMembersMutation()
  const { mutateAsync: postProgress, isPending: isPosting } =
    usePostGoalProgressMutation()

  const { members } = useModuleStore()

  const handleGetStaff = useCallback(() => {
    if (!parsedModuleId) return

    getMembers({
      condition: {
        MODULE_ID: parsedModuleId,
        STATE: 'A',
      },
    })
  }, [parsedModuleId])

  useEffect(handleGetStaff, [handleGetStaff])

  useEffect(() => {
    if (!currentPeriod) return
    if (!form.getFieldValue('PERIOD')) {
      form.setFieldValue('PERIOD', currentPeriod)
    }
  }, [currentPeriod, form])

  useEffect(() => {
    if (!parsedModuleId) return
    form.setFieldValue('MODULE_ID', parsedModuleId)
    form.setFieldValue('SCOPE', 'module')
  }, [form, parsedModuleId])

  useEffect(() => {
    if (!members.length) {
      form.setFieldsValue({ CONTRIBUTIONS: [] })
      return
    }
    const currentContributions =
      (form.getFieldValue('CONTRIBUTIONS') as StaffContribution[]) ?? []

    const contributionsById = new Map<number, StaffContribution>(
      currentContributions
        .filter((item) => item?.STAFF_ID)
        .map((item) => [item.STAFF_ID, item])
    )

    const nextValues = members.map((staff) => {
      const existing = contributionsById.get(staff.STAFF_ID)
      return {
        STAFF_ID: staff.STAFF_ID,
        STAFF_NAME: `${staff.NAME} ${staff.LAST_NAME}`.trim(),
        ACTUAL_VALUE: existing?.ACTUAL_VALUE ?? null,
      }
    })

    form.setFieldsValue({ CONTRIBUTIONS: nextValues })
  }, [form, members])

  const contributionTotal = useMemo(() => {
    if (!Array.isArray(contributions)) return 0
    return contributions.reduce((acc, item) => {
      const value = Number(item?.ACTUAL_VALUE ?? 0)
      return acc + (Number.isFinite(value) ? value : 0)
    }, 0)
  }, [contributions])

  const difference = useMemo(() => {
    const total = Number(actualValue ?? 0)
    return total - contributionTotal
  }, [actualValue, contributionTotal])

  const formatStaffName = (staff: StaffContribution, fallback?: Staff) => {
    if (staff?.STAFF_NAME) return staff.STAFF_NAME
    if (fallback) {
      return `${fallback.NAME} ${fallback.LAST_NAME}`.trim()
    }
    return `Empleado ${staff?.STAFF_ID ?? ''}`.trim()
  }

  const hasStaff = members.length > 0

  const handleSubmit = useCallback(
    async (
      values: PostGoalProgressPayload & { CONTRIBUTIONS?: StaffContribution[] }
    ) => {
      if (!parsedModuleId) {
        message.warning('No se ha seleccionado un módulo válido.')
        return
      }

      try {
        const sanitizedContributions =
          values.CONTRIBUTIONS?.map((item) => ({
            STAFF_ID: Number(item?.STAFF_ID),
            ACTUAL_VALUE: Number(item?.ACTUAL_VALUE ?? 0),
          })).filter(
            (item) =>
              Number.isInteger(item.ACTUAL_VALUE) &&
              item.STAFF_ID &&
              item.ACTUAL_VALUE >= 0
          ) ?? []

        const payload: PostGoalProgressPayload = {
          GOAL_ID: Number(values.GOAL_ID),
          SCOPE: 'module',
          PERIOD: Number(values.PERIOD),
          ACTUAL_VALUE: Number(values.ACTUAL_VALUE ?? 0),
          MODULE_ID: parsedModuleId,
          CONTRIBUTIONS: hasStaff ? sanitizedContributions : undefined,
        }

        await postProgress(payload)

        await queryClient.invalidateQueries({
          queryKey: [
            'goals',
            'summary',
            'module',
            parsedModuleId,
            payload.PERIOD,
          ],
        })

        message.success('Progreso registrado con éxito.')
        form.resetFields(['GOAL_ID', 'ACTUAL_VALUE', 'CONTRIBUTIONS'])
        onCancel?.()
      } catch (error) {
        errorHandler(error)
      }
    },
    [
      parsedModuleId,
      message,
      postProgress,
      queryClient,
      form,
      onCancel,
      errorHandler,
      hasStaff,
    ]
  )

  return (
    <CustomModal
      title={'Registrar Progreso'}
      width={'40%'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={'Registrar'}
      okButtonProps={{ loading: isPosting }}
      destroyOnHidden
    >
      <CustomSpin spinning={isGetMembersLoading || isPosting}>
        <CustomForm
          form={form}
          {...formItemLayout}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            SCOPE: 'module',
            MODULE_ID: parsedModuleId,
            PERIOD: period ?? currentPeriod,
          }}
        >
          <CustomFormItem name={'SCOPE'} hidden initialValue={'module'}>
            <input />
          </CustomFormItem>
          <CustomFormItem
            name={'MODULE_ID'}
            hidden
            initialValue={parsedModuleId}
          >
            <input />
          </CustomFormItem>
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
            <CustomCol {...defaultBreakpoints}>
              <CustomFormItem
                label={'Valor total'}
                name={'ACTUAL_VALUE'}
                rules={[
                  { required: true },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.resolve()
                      }
                      if (!Number.isInteger(Number(value))) {
                        return Promise.reject(
                          new Error('El valor debe ser un número entero.')
                        )
                      }
                      if (hasStaff && difference !== 0) {
                        return Promise.reject(
                          new Error(
                            'La suma de los aportes debe coincidir con el total.'
                          )
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <CustomInputNumber
                  min={0}
                  precision={0}
                  format={{ format: 'default' }}
                />
              </CustomFormItem>
            </CustomCol>
          </CustomRow>
          <CustomDivider>Aportes por colaborador</CustomDivider>
          {!members.length && (
            <CustomText type="secondary">
              No se encontraron colaboradores activos para este módulo.
            </CustomText>
          )}
          <CustomFormList name={'CONTRIBUTIONS'}>
            {(fields) => (
              <CustomSpace direction="horizontal" wrap>
                {fields.map((field) => {
                  const fieldValue = form.getFieldValue([
                    'CONTRIBUTIONS',
                    field.name,
                  ]) as StaffContribution
                  const fallbackStaff = members.find(
                    (item) => item.STAFF_ID === fieldValue?.STAFF_ID
                  )

                  return (
                    <CustomCol span={24} key={field.key}>
                      <CustomSpace width={'max-content'} direction="horizontal">
                        <CustomFormItem>
                          <CustomInput
                            tabIndex={-1}
                            value={formatStaffName(fieldValue, fallbackStaff)}
                            variant={'filled'}
                            readOnly
                          />
                        </CustomFormItem>

                        <CustomFormItem
                          name={[field.name, 'ACTUAL_VALUE']}
                          rules={[
                            {
                              type: 'number',
                              min: 0,
                              message: 'Ingresa un valor válido.',
                            },
                          ]}
                        >
                          <CustomInputNumber
                            min={0}
                            precision={0}
                            placeholder="Cantidad"
                            style={{ width: 140 }}
                          />
                        </CustomFormItem>
                      </CustomSpace>
                      <CustomFormItem
                        name={[field.name, 'STAFF_ID']}
                        hidden
                        initialValue={fieldValue?.STAFF_ID}
                      >
                        <input />
                      </CustomFormItem>
                    </CustomCol>
                  )
                })}
              </CustomSpace>
            )}
          </CustomFormList>

          {hasStaff && (
            <CustomSpace direction="vertical" size={4}>
              <CustomText type="secondary">
                Total aportado por el equipo: {contributionTotal}
              </CustomText>
              <CustomText type={difference === 0 ? 'success' : 'danger'}>
                Diferencia con el total: {difference}
              </CustomText>
            </CustomSpace>
          )}
        </CustomForm>
      </CustomSpin>
    </CustomModal>
  )
}

export default ProgressForm
