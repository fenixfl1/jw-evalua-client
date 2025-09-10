import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form, InputNumber } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import GoalForm from './GoalForm'
import ModuleGoalForm from './ModuleGoalForm'
import CustomButton from 'src/components/custom/CustomButton'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomProgress from 'src/components/custom/CustomProgress'
import CustomDivider from 'src/components/custom/CustomDivider'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useCreateGoalMutation } from 'src/services/goals/useCreateGoalMutation'
import { useAssignGoalToModuleMutation } from 'src/services/goals/useAssignGoalToModuleMutation'
import { usePostGoalProgressMutation } from 'src/services/goals/usePostGoalProgressMutation'
import { useGetModuleSummaryPaginationMutation } from 'src/services/goals/useGetModuleSummaryPaginationMutation'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import SmartTable from 'src/components/SmartTable'
import { ModuleSummaryDetail } from 'src/services/goals/types'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomCol from 'src/components/custom/CustomCol'
import { AdvancedCondition } from 'src/types/general'
import { useGoalStore } from 'src/store/goal.store'
import useDebounce from 'src/hooks/use-debounce'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useErrorHandler } from 'src/hooks/use-error-handler'

type Module = {
  MODULE_ID: number
  DESCRIPTION: string
}

type GoalStatus =
  | 'Activa'
  | 'En curso'
  | 'Atrasada'
  | 'Completada'
  | 'Archivada'

dayjs.extend(weekOfYear)
const currentPeriod = Number(
  `${dayjs().year()}${String(dayjs().week()).padStart(2, '0')}`
)
const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    PERIOD_ID__EQ: currentPeriod,
  },
}

export type TeamGoal = {
  id: number
  name: string
  unit: string
  target: number
  actual: number
  weight: number
  groupId: number // MODULE_ID
  periodId: number
  periodName: string
  owner: string
  status: GoalStatus
  dueDate?: string
  updatedAt: string
  description?: string
}

type GoalsProps = {
  module: Module
}

const Goals: React.FC<GoalsProps> = ({ module }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [errorHandler] = useErrorHandler()

  const [createModalState, setCreateModalState] = useState(false)
  const [createServerModal, setCreateServerModal] = useState(false)
  dayjs.extend(weekOfYear)

  const periodOptions = useMemo(() => {
    const year = dayjs().year()
    return Array.from({ length: 53 }, (_, i) => {
      const w = i + 1
      const value = Number(`${year}${String(w).padStart(2, '0')}`)
      return { value, label: `${year}-W${String(w).padStart(2, '0')}` }
    })
  }, [])

  const { mutateAsync: createGoal } = useCreateGoalMutation()
  const { mutateAsync: assignGoal, isPending: isAssigning } =
    useAssignGoalToModuleMutation()
  const { mutateAsync: postProgress, isPending: isPosting } =
    usePostGoalProgressMutation()
  const { mutate: getSummary, isPending: isGetSummaryPending } =
    useGetModuleSummaryPaginationMutation()

  const { metadata, moduleSummary } = useGoalStore()

  const toggleModalState = () => setCreateModalState(!createModalState)
  const toggleCreateServerModal = () => setCreateServerModal((s) => !s)
  const [editing, setEditing] = useState<TeamGoal | null>(null)
  const [open, setOpen] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  useEffect(() => {
    if (createModalState) setOpen(true)
  }, [createModalState])

  const filter = (
    <>
      <CustomFormItem
        labelCol={{ span: 24 }}
        name={'PERIOD_ID'}
        label={'Periodo'}
      >
        <CustomSelect
          allowClear
          placeholder="Periodo (YYYYWW)"
          style={{ width: 220 }}
          options={periodOptions}
        />
      </CustomFormItem>
    </>
  )

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      const { FILTER } = form.getFieldsValue()

      const condition: AdvancedCondition[] = []
      const filter = getConditionFromForm(FILTER)

      if (filter.length) {
        condition.concat(filter)
      }

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      getSummary({ page, size, condition })
    },
    [debounce]
  )

  useEffect(handleSearch, [handleSearch])

  const columns: ColumnsType<ModuleSummaryDetail> = [
    {
      align: 'center',
      dataIndex: 'GOAL_ID',
      key: 'GOAL_ID',
      title: 'Código',
      width: '5%',
    },
    { dataIndex: 'DESCRIPTION', key: 'DESCRIPTION', title: 'Meta' },
    {
      key: 'period',
      title: 'Periodo',
      // render: () =>
      //   periodId
      //     ? `${String(periodId).slice(0, 4)}-W${String(periodId).slice(4)}`
      //     : '—',
    },
    {
      dataIndex: 'TARGET_VALUE',
      key: 'TARGET_VALUE',
      title: 'Objetivo',
      width: '12%',
    },
    {
      dataIndex: 'ACTUAL_VALUE',
      key: 'ACTUAL_VALUE',
      title: 'Real',
      width: '12%',
    },
    {
      dataIndex: 'WEIGHT',
      key: 'WEIGHT',
      title: 'Peso %',
      width: '10%',
    },
    {
      dataIndex: 'COMPLIANCE',
      key: 'COMPLIANCE',
      title: 'Progreso',
      render: (_, record) => (
        <CustomProgress
          percent={Math.round(Math.min(record.COMPLIANCE || 0, 100))}
          showInfo
        />
      ),
    },
    {
      key: 'owner',
      dataIndex: 'owner',
      title: 'Responsable',
      render: () => module['SUPERVISOR_NAME'] ?? '—',
    },
  ]

  return (
    <>
      <CustomSpace>
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
                        name="GOAL_ID"
                        rules={[{ required: true }]}
                      >
                        <CustomSelect
                          style={{ width: 260 }}
                          placeholder="Selecciona meta"
                          options={moduleSummary.map((g) => ({
                            value: g.GOAL_ID,
                            label: `${g.GOAL_ID} - ${g.DESCRIPTION}`,
                          }))}
                        />
                      </CustomFormItem>
                      <CustomFormItem
                        name="PERIOD_ID"
                        rules={[{ required: true }]}
                      >
                        <CustomSelect
                          style={{ width: 220 }}
                          placeholder="Periodo (YYYYWW)"
                          options={periodOptions}
                        />
                      </CustomFormItem>
                      <CustomFormItem
                        name={'TARGET_VALUE'}
                        rules={[{ required: true }]}
                      >
                        <CustomInputNumber min={1} placeholder={'Objetivo'} />
                      </CustomFormItem>
                      <CustomFormItem>
                        <CustomButton
                          loading={isAssigning}
                          onClick={async () => {
                            try {
                              const values = await form.validateFields()

                              await assignGoal({
                                GOAL_ID: values.GOAL_ID,
                                MODULE_ID: module.MODULE_ID,
                                PERIOD_ID: Number(values.PERIOD_ID),
                                TARGET_VALUE: Number(values.TARGET_VALUE),
                              })
                              message.success('Asignación registrada')
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
                      layout="inline"
                      onFinish={async (values) => {
                        await postProgress({
                          GOAL_ID: values.GOAL_ID,
                          SCOPE: 'module',
                          MODULE_ID: module.MODULE_ID,
                          PERIOD_ID: Number(values.PERIOD_ID),
                          ACTUAL_VALUE: Number(values.ACTUAL_VALUE),
                        })
                        message.success('Progreso registrado')
                      }}
                    >
                      <CustomFormItem
                        name="GOAL_ID"
                        rules={[{ required: true }]}
                      >
                        <CustomSelect
                          style={{ width: 260 }}
                          placeholder="Meta"
                          options={moduleSummary.map((g) => ({
                            value: g.GOAL_ID,
                            label: `${g.GOAL_ID} - ${g.DESCRIPTION}`,
                          }))}
                        />
                      </CustomFormItem>
                      <CustomFormItem
                        name="PERIOD_ID"
                        rules={[{ required: true }]}
                      >
                        <CustomSelect
                          style={{ width: 220 }}
                          placeholder="Periodo (YYYYWW)"
                          options={periodOptions}
                        />
                      </CustomFormItem>
                      <CustomFormItem
                        name="ACTUAL_VALUE"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          placeholder="Real"
                          style={{ width: 160 }}
                        />
                      </CustomFormItem>
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

        <CustomDivider />
        <SmartTable
          loading={isGetSummaryPending}
          columns={columns}
          createText={'Crear meta'}
          dataSource={moduleSummary}
          filter={filter}
          form={form}
          initialFilter={initialFilter}
          metadata={metadata}
          onChange={handleSearch}
          onCreate={toggleCreateServerModal}
          onSearch={setSearchKey}
          rowKey={'GOAL_ID'}
          searchPlaceholder={'Buscar metas...'}
          showActions={false}
          showStates={false}
        />
      </CustomSpace>

      <ConditionalComponent condition={createModalState}>
        <GoalForm
          open={open}
          initial={editing ?? undefined}
          onSubmit={() => null}
          onCancel={() => {
            setOpen(false)
            setEditing(null)
            toggleModalState()
          }}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={createServerModal}>
        <ModuleGoalForm
          open={createServerModal}
          onCancel={toggleCreateServerModal}
          onSubmit={async (values) => {
            await createGoal({
              ...values,
              MODULE_ID: module.MODULE_ID,
              SCOPE: 'module',
            })
            // await refetchModuleGoals()
            message.success('Meta creada')
            toggleCreateServerModal()
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default Goals
