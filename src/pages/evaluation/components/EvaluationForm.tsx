import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useEvaluationStore } from 'src/store/evaluation.store'
import { useModuleStore } from 'src/store/module.store'
import { useStaffStore } from 'src/store/staff.store'
import { AdvancedCondition } from 'src/types/general'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useGetPaginatedStaffMutation } from 'src/services/staff/userGetPaginatedStaffMutation'
import { useCreateEvaluationMutation } from 'src/services/evaluations/useCreateEvaluationMutation'
import { useUpdateEvaluationMutation } from 'src/services/evaluations/useUpdateEvaluationMutation'
import { useGetEvaluationQuery } from 'src/services/evaluations/useGetEvaluationQuery'
import {
  CreateEvaluationPayload,
  EvaluationDetailPayload,
  UpdateEvaluationPayload,
} from 'src/services/evaluations/evaluation.types'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { Form } from 'antd'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomFormList from 'src/components/custom/CustomFormList'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import CustomCol from 'src/components/custom/CustomCol'
import CustomRow from 'src/components/custom/CustomRow'
import CustomAlert from 'src/components/custom/CustomAlert'
import { Lightbulb } from 'lucide-react'
import CustomCollapse from 'src/components/custom/CustomCollapse'
import CustomInput from 'src/components/custom/CustomInput'
import CustomTooltip from 'src/components/custom/CustomTooltip'

type EvaluationFormMode = 'create' | 'edit'

type EvaluationFormProps = {
  open: boolean
  mode: EvaluationFormMode
  evaluationId?: number
  onClose: () => void
  onSuccess: () => void
}

type FormValues = (CreateEvaluationPayload & UpdateEvaluationPayload) & {
  DETAILS: EvaluationDetailPayload[]
}

const emptyDetail: Partial<EvaluationDetailPayload> = {
  COMPETENCY_ID: undefined,
  GOAL_ID: null,
  WEIGHT: null,
  SCORE: null,
  COMMENT: null,
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  open,
  mode,
  evaluationId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<FormValues>()
  const details = Form.useWatch('DETAILS', form)
  const [activeKey, setActiveKey] = useState<string[]>(['0'])
  const [deletedDetails, setDeletedDetails] = useState<
    EvaluationDetailPayload[]
  >([])
  const [periodOptions, currentPeriod] = useGetPeriods()
  const [errorHandler] = useErrorHandler()

  const { selectedEvaluation, setSelectedEvaluation } = useEvaluationStore()
  const { workModules } = useModuleStore()
  const { staffList } = useStaffStore()

  const { mutateAsync: fetchModules } = useGetPaginatedModulesMutation()
  const { mutateAsync: fetchStaff } = useGetPaginatedStaffMutation()
  const { mutateAsync: createEvaluation, isPending: isCreating } =
    useCreateEvaluationMutation()
  const { mutateAsync: updateEvaluation, isPending: isUpdating } =
    useUpdateEvaluationMutation()

  const { isFetching: isFetchingEvaluation } = useGetEvaluationQuery(
    mode === 'edit' ? evaluationId : undefined
  )

  useEffect(() => {
    if (!open) return

    const condition: AdvancedCondition[] = [
      { field: 'STATE', operator: '=', value: 'A' },
    ]

    fetchModules({ condition, page: 1, size: 100 }).catch(() => undefined)
    fetchStaff({ condition, page: 1, size: 100 }).catch(() => undefined)
  }, [open, fetchModules, fetchStaff])

  useEffect(() => {
    if (!open) return

    if (mode === 'edit') {
      if (!selectedEvaluation) return

      form.setFieldsValue({
        MODULE_ID: selectedEvaluation.MODULE_ID,
        STAFF_ID: selectedEvaluation.STAFF_ID,
        EVALUATOR_ID: selectedEvaluation.EVALUATOR_ID ?? null,
        GOAL_ID: selectedEvaluation.GOAL_ID ?? null,
        GOAL_STAFF_ID: selectedEvaluation.GOAL_STAFF_ID ?? null,
        PERIOD: selectedEvaluation.PERIOD,
        OVERALL_SCORE: selectedEvaluation.OVERALL_SCORE ?? null,
        COMMENTS: selectedEvaluation.COMMENTS ?? '',
        DETAILS: selectedEvaluation.DETAILS?.length
          ? selectedEvaluation.DETAILS.map((detail) => ({
              COMPETENCY_ID: detail.COMPETENCY_ID,
              GOAL_ID: detail.GOAL_ID ?? null,
              WEIGHT: detail.WEIGHT ?? null,
              SCORE: detail.SCORE ?? null,
              COMMENT: detail.COMMENT ?? null,
              EVALUATION_DETAIL_ID: detail.EVALUATION_DETAIL_ID,
            }))
          : ([{ ...emptyDetail }] as EvaluationDetailPayload[]),
      })
      setDeletedDetails([])
    } else {
      form.setFieldsValue({
        MODULE_ID: undefined,
        STAFF_ID: undefined,
        EVALUATOR_ID: null,
        GOAL_ID: null,
        GOAL_STAFF_ID: null,
        PERIOD: currentPeriod,
        OVERALL_SCORE: null,
        COMMENTS: '',
        DETAILS: [{ ...emptyDetail }] as EvaluationDetailPayload[],
      })
      setDeletedDetails([])
    }
  }, [open, mode, selectedEvaluation, form, currentPeriod])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setDeletedDetails([])
      setSelectedEvaluation(null)
    }
  }, [open, form, setSelectedEvaluation])

  const moduleOptions = useMemo(
    () =>
      workModules.map((module) => ({
        value: module.MODULE_ID,
        label: `${module.MODULE_ID} - ${module.DESCRIPTION}`,
      })),
    [workModules]
  )

  const staffOptions = useMemo(
    () =>
      staffList.map((staff) => ({
        value: staff.STAFF_ID,
        label: `${staff.STAFF_ID} - ${staff.NAME} ${staff.LAST_NAME}`,
      })),
    [staffList]
  )

  const periodSelectOptions = useMemo(
    () =>
      periodOptions.map((period) => ({
        label: period.label,
        value: period.value,
      })),
    [periodOptions]
  )

  const loading = isCreating || isUpdating || isFetchingEvaluation

  const handleRemoveDetail = (
    index: number,
    remove: (index: number) => void
  ) => {
    const details = form.getFieldValue('DETAILS') || []
    const currentDetail = details[index] as EvaluationDetailPayload | undefined

    if (mode === 'edit' && currentDetail?.EVALUATION_DETAIL_ID) {
      setDeletedDetails((previous) => [
        ...previous,
        {
          COMPETENCY_ID: currentDetail.COMPETENCY_ID,
          GOAL_ID: currentDetail.GOAL_ID ?? null,
          WEIGHT: currentDetail.WEIGHT ?? null,
          SCORE: currentDetail.SCORE ?? null,
          COMMENT: currentDetail.COMMENT ?? null,
          EVALUATION_DETAIL_ID: currentDetail.EVALUATION_DETAIL_ID,
          _ACTION: 'delete',
        },
      ])
    }

    remove(index)
  }

  const normalizeDetails = (
    details: EvaluationDetailPayload[] = []
  ): EvaluationDetailPayload[] => {
    return details
      .filter(
        (detail) =>
          detail?.COMPETENCY_ID !== undefined && detail?.COMPETENCY_ID !== null
      )
      .map((detail) => ({
        COMPETENCY_ID: Number(detail.COMPETENCY_ID),
        GOAL_ID: detail.GOAL_ID ?? null,
        WEIGHT: detail.WEIGHT ?? null,
        SCORE: detail.SCORE ?? null,
        COMMENT: detail.COMMENT ?? null,
        EVALUATION_DETAIL_ID: detail.EVALUATION_DETAIL_ID,
      }))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const { DETAILS = [], ...rest } = values

      const detailPayload = normalizeDetails(DETAILS)

      const basePayload = {
        MODULE_ID: rest.MODULE_ID,
        STAFF_ID: rest.STAFF_ID,
        EVALUATOR_ID: rest.EVALUATOR_ID ?? null,
        GOAL_ID: rest.GOAL_ID ?? null,
        GOAL_STAFF_ID: rest.GOAL_STAFF_ID ?? null,
        PERIOD: rest.PERIOD ?? currentPeriod,
        OVERALL_SCORE: rest.OVERALL_SCORE ?? null,
        COMMENTS: rest.COMMENTS ?? null,
      }

      if (mode === 'create') {
        await createEvaluation({
          ...basePayload,
          DETAILS: detailPayload,
        })
      } else if (evaluationId) {
        const detailsWithActions: EvaluationDetailPayload[] = [
          ...detailPayload.map(
            (detail) =>
              ({
                ...detail,
                _ACTION: detail.EVALUATION_DETAIL_ID ? 'update' : 'create',
              } as never)
          ),
          ...deletedDetails,
        ]

        await updateEvaluation({
          evaluationId,
          ...basePayload,
          DETAILS: detailsWithActions,
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <CustomModal
      width={'50%'}
      open={open}
      title={mode === 'create' ? 'Registrar Evaluación' : 'Editar Evaluación'}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === 'create' ? 'Crear Evaluación' : 'Guardar cambios'}
      confirmLoading={loading}
    >
      <CustomForm
        form={form}
        {...formItemLayout}
        initialValues={{ DETAILS: [{ ...emptyDetail }] }}
      >
        <CustomRow justify={'start'}>
          <CustomCol xs={24}>
            <CustomFormItem
              label="Módulo"
              name="MODULE_ID"
              rules={[{ required: true, message: 'Selecciona el módulo' }]}
              {...labelColFullWidth}
            >
              <CustomSelect
                showSearch
                placeholder="Selecciona el módulo"
                options={moduleOptions}
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              tooltip={'Empleado que esta siendo evaluado'}
              label={'Colaborador'}
              name={'STAFF_ID'}
              rules={[{ required: true, message: 'Selecciona al colaborador' }]}
            >
              <CustomSelect
                showSearch
                placeholder={'Selecciona al colaborador'}
                options={staffOptions}
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </CustomFormItem>
          </CustomCol>

          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Evaluador" name="EVALUATOR_ID">
              <CustomSelect
                allowClear
                showSearch
                placeholder="Selecciona al evaluador"
                options={staffOptions}
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label="Periodo"
              name="PERIOD"
              initialValue={currentPeriod}
              rules={[{ required: true, message: 'Selecciona el periodo' }]}
            >
              <CustomSelect
                showSearch
                placeholder="Selecciona el periodo"
                options={periodSelectOptions}
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Meta vinculada" name="GOAL_ID">
              <CustomInputNumber
                min={1}
                placeholder={'ID de meta (opcional)'}
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label="Asignación"
              name="GOAL_STAFF_ID"
              tooltip={'Asignación de meta'}
            >
              <CustomInputNumber
                style={{ width: 220 }}
                min={1}
                placeholder="ID de Asignación (opcional)"
              />
            </CustomFormItem>
          </CustomCol>

          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem label="Calificación" name="OVERALL_SCORE">
              <CustomInputNumber
                style={{ width: 220 }}
                min={0}
                max={100}
                placeholder="0 - 100"
              />
            </CustomFormItem>
          </CustomCol>

          <CustomCol xs={24}>
            <CustomFormItem
              label="Comentarios"
              name="COMMENTS"
              style={{ flex: 1 }}
              {...labelColFullWidth}
            >
              <CustomTextArea rows={2} placeholder="Notas del evaluador" />
            </CustomFormItem>
          </CustomCol>

          <CustomDivider orientation="left">
            Detalles por competencia
          </CustomDivider>
          <CustomSpace>
            <CustomCol xs={24}>
              <CustomAlert
                type={'info'}
                icon={
                  <Lightbulb size={32} strokeWidth={0.75} absoluteStrokeWidth />
                }
                message={
                  <CustomText type="secondary">
                    Registra las competencias evaluadas, pesos y resultados
                    individuales.
                  </CustomText>
                }
              />
            </CustomCol>
            <CustomFormList name="DETAILS">
              {(fields, { add, remove }) => (
                <CustomSpace size={'small'}>
                  <CustomCol xs={24}>
                    <CustomCollapse
                      accordion
                      activeKey={activeKey}
                      onChange={setActiveKey}
                      items={fields.map(({ name, ...restField }) => ({
                        label: '',
                        key: `${name}`,
                        extra: (
                          <CustomTooltip title={''}>
                            <CustomButton
                              type={'text'}
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => handleRemoveDetail(name, remove)}
                            />
                          </CustomTooltip>
                        ),
                        children: (
                          <CustomRow justify={'start'}>
                            <CustomCol {...defaultBreakpoints}>
                              <CustomFormItem
                                {...restField}
                                label="Competencia ID"
                                name={[name, 'COMPETENCY_ID']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Ingresa el ID de la competencia',
                                  },
                                ]}
                              >
                                <CustomInputNumber
                                  style={{ width: 160 }}
                                  min={1}
                                  placeholder="Ej. 101"
                                />
                              </CustomFormItem>
                            </CustomCol>

                            <CustomCol {...defaultBreakpoints}>
                              <CustomFormItem
                                {...restField}
                                label="Meta"
                                name={[name, 'GOAL_ID']}
                              >
                                <CustomInputNumber
                                  style={{ width: 140 }}
                                  min={1}
                                  placeholder="Opcional"
                                />
                              </CustomFormItem>
                            </CustomCol>
                            <CustomCol {...defaultBreakpoints}>
                              <CustomFormItem
                                {...restField}
                                label="Peso (%)"
                                name={[name, 'WEIGHT']}
                              >
                                <CustomInputNumber
                                  style={{ width: 140 }}
                                  min={0}
                                  max={100}
                                  placeholder="Opcional"
                                />
                              </CustomFormItem>
                            </CustomCol>
                            <CustomCol {...defaultBreakpoints}>
                              <CustomFormItem
                                {...restField}
                                label="Calificación"
                                name={[name, 'SCORE']}
                              >
                                <CustomInputNumber
                                  style={{ width: 140 }}
                                  min={0}
                                  max={100}
                                  placeholder="0 - 100"
                                />
                              </CustomFormItem>
                            </CustomCol>
                            <CustomCol xs={24}>
                              <CustomFormItem
                                {...restField}
                                label="Comentario"
                                name={[name, 'COMMENT']}
                                {...labelColFullWidth}
                              >
                                <CustomInput placeholder="Comentario" />
                              </CustomFormItem>
                            </CustomCol>
                          </CustomRow>
                        ),
                      }))}
                    />
                  </CustomCol>

                  <CustomButton
                    icon={<PlusOutlined />}
                    type="dashed"
                    block
                    size={'small'}
                    onClick={() => {
                      add({ ...emptyDetail } as EvaluationDetailPayload)
                      setActiveKey([`${details?.length}`])
                    }}
                  >
                    Agregar competencia
                  </CustomButton>
                </CustomSpace>
              )}
            </CustomFormList>
          </CustomSpace>
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default EvaluationForm
