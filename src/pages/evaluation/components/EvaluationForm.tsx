import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { useEvaluationStore } from 'src/store/evaluation.store'
import { useModuleStore } from 'src/store/module.store'
import { useStaffStore } from 'src/store/staff.store'
import { AdvancedCondition } from 'src/types/general'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useGetPaginatedStaffMutation } from 'src/services/staff/userGetPaginatedStaffMutation'
import { useGetCompetenciesQuery } from 'src/services/competencies/useGetCompetenciesQuery'
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
import styled from 'styled-components'
import useDebounce from 'src/hooks/use-debounce'
import { getSessionInfo } from 'src/lib/session'

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

const DetailContainer = styled.div`
  width: 100%;
  max-height: 18rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
`

const Container = styled.div`
  width: 100%;
  max-height: 380px;
  overflow-y: auto;
`

const emptyDetail: Partial<EvaluationDetailPayload> = {
  COMPETENCY_ID: undefined,
  GOAL_STAFF_ID: null,
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
  const module = Form.useWatch('MODULE_ID', form)
  const [searchStaffKey, setSearchStaffKey] = useState('')
  const staffDebounce = useDebounce(searchStaffKey)
  const [activeKey, setActiveKey] = useState<string[]>(['0'])
  const [deletedDetails, setDeletedDetails] = useState<
    EvaluationDetailPayload[]
  >([])
  const [periodOptions, currentPeriod] = useGetPeriods()
  const [errorHandler] = useErrorHandler()

  const { selectedEvaluation, setSelectedEvaluation } = useEvaluationStore()
  const { workModules } = useModuleStore()
  const { staffList, setStaffList } = useStaffStore()
  const { data: competencies = [], isFetching: isFetchingCompetencies } =
    useGetCompetenciesQuery(open)
  const competencyOptions = useMemo(
    () =>
      competencies.map((competency) => ({
        label: competency.NAME,
        value: competency.COMPETENCY_ID,
      })),
    [competencies]
  )

  const { mutateAsync: fetchModules } = useGetPaginatedModulesMutation()
  const { mutateAsync: fetchStaff } = useGetPaginatedStaffMutation()
  const { mutateAsync: createEvaluation, isPending: isCreating } =
    useCreateEvaluationMutation()
  const { mutateAsync: updateEvaluation, isPending: isUpdating } =
    useUpdateEvaluationMutation()

  const { isFetching: isFetchingEvaluation } = useGetEvaluationQuery(
    mode === 'edit' ? evaluationId : undefined
  )

  const handleSearchStaff = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        field: 'STATE',
        operator: '=',
        value: 'A',
      },
    ]

    if (module) {
      condition.push({
        value: module,
        operator: '=',
        field: 'MODULE',
      })
    }

    if (staffDebounce) {
      condition.push({
        value: staffDebounce,
        field: 'FILTER',
        operator: 'LIKE',
      })
    }

    fetchStaff({ condition, page: 1, size: 50 })
  }, [staffDebounce, module])

  useEffect(handleSearchStaff, [handleSearchStaff])

  useEffect(() => {
    return () => {
      setStaffList({
        data: [],
        metadata: {
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRows: 0,
            count: 0,
            pageSize: 0,
            links: undefined,
          },
        },
      })
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const condition: AdvancedCondition[] = []

    fetchModules({ condition, page: 1, size: 100 }).catch(() => undefined)
  }, [open, fetchModules, fetchStaff])

  useEffect(() => {
    const parsedDetails = (details ?? [])
      .map((detail) => {
        const rawScore = detail?.SCORE
        const rawWeight = detail?.WEIGHT

        const score =
          rawScore === undefined || rawScore === null ? null : Number(rawScore)
        const weight =
          rawWeight === undefined || rawWeight === null
            ? null
            : Number(rawWeight)

        return {
          score: Number.isFinite(score)
            ? Math.min(Math.max(score, 0), 100)
            : null,
          weight: Number.isFinite(weight) && weight > 0 ? weight : null,
        }
      })
      .filter((item) => item.score !== null)

    if (!parsedDetails.length) {
      form.setFieldValue('OVERALL_SCORE', 0)
      return
    }

    const totalWeight = parsedDetails.reduce(
      (acc, { weight }) => acc + (weight ?? 0),
      0
    )

    const overall =
      totalWeight > 0
        ? parsedDetails.reduce((acc, { score, weight }) => {
            return acc + ((score ?? 0) * (weight ?? 0)) / totalWeight
          }, 0)
        : parsedDetails.reduce((acc, { score }) => acc + (score ?? 0), 0) /
          parsedDetails.length

    const boundedScore = Math.max(0, Math.min(100, Number(overall.toFixed(2))))

    form.setFieldValue('OVERALL_SCORE', boundedScore)
  }, [details, form])

  useEffect(() => {
    if (!open) return

    if (mode === 'edit') {
      if (!selectedEvaluation) return

      form.setFieldsValue({
        MODULE_ID: selectedEvaluation.MODULE_ID,
        STAFF_ID: selectedEvaluation.STAFF_ID,
        EVALUATOR_ID: selectedEvaluation.EVALUATOR_ID ?? null,
        PERIOD: selectedEvaluation.PERIOD,
        OVERALL_SCORE: selectedEvaluation.OVERALL_SCORE ?? null,
        COMMENTS: selectedEvaluation.COMMENTS ?? '',
        DETAILS: selectedEvaluation.DETAILS?.length
          ? selectedEvaluation.DETAILS.map((detail) => ({
              COMPETENCY_ID: detail.COMPETENCY_ID,
              GOAL_STAFF_ID:
                detail.GOAL_STAFF_ID !== undefined &&
                detail.GOAL_STAFF_ID !== null
                  ? Number(detail.GOAL_STAFF_ID)
                  : null,
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
      staffList
        .filter((item) => item.USER_ID !== Number(getSessionInfo().userId))
        .map((staff) => ({
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
          GOAL_STAFF_ID:
            currentDetail.GOAL_STAFF_ID !== undefined &&
            currentDetail.GOAL_STAFF_ID !== null
              ? Number(currentDetail.GOAL_STAFF_ID)
              : null,
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
        GOAL_STAFF_ID:
          detail.GOAL_STAFF_ID !== undefined && detail.GOAL_STAFF_ID !== null
            ? Number(detail.GOAL_STAFF_ID)
            : null,
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

  const getItemLabel = useCallback(
    (name: number) => {
      const item = competencies?.find(
        (item) => item.COMPETENCY_ID === details[name].COMPETENCY_ID
      )

      return item?.NAME
    },
    [details]
  )

  return (
    <CustomModal
      width={'55%'}
      open={open}
      title={mode === 'create' ? 'Registrar evaluación' : 'Editar evaluación'}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === 'create' ? 'Crear evaluación' : 'Guardar cambios'}
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
              label="Modulo"
              name="MODULE_ID"
              rules={[{ required: true }]}
              {...labelColFullWidth}
            >
              <CustomSelect
                showSearch
                placeholder={'Selecciona el Modulo'}
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
              label={'Empleado'}
              name={'STAFF_ID'}
              rules={[{ required: true }]}
            >
              <CustomSelect
                onSearch={setSearchStaffKey}
                options={staffOptions}
                placeholder={'Seleccionar Empleado'}
              />
            </CustomFormItem>
          </CustomCol>
          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label={'Periodo'}
              name={'PERIOD'}
              rules={[{ required: true }]}
            >
              <CustomSelect
                options={periodSelectOptions}
                placeholder={'Seleccionar periodo'}
              />
            </CustomFormItem>
          </CustomCol>

          <CustomCol {...defaultBreakpoints}>
            <CustomFormItem
              label={'Calificación'}
              name={'OVERALL_SCORE'}
              initialValue={0}
              rules={[{ required: true }]}
            >
              <CustomInputNumber readOnly min={0} />
            </CustomFormItem>
          </CustomCol>

          <CustomCol xs={24}>
            <CustomFormItem
              label="Comentarios"
              name="COMMENTS"
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
            <Container>
              <CustomFormList name={'DETAILS'}>
                {(fields, { add, remove }) => (
                  <CustomSpace size={'small'}>
                    <CustomCol xs={24}>
                      <DetailContainer>
                        <CustomCollapse
                          accordion
                          activeKey={activeKey}
                          onChange={setActiveKey}
                          items={fields.map(({ name, ...restField }) => ({
                            label: getItemLabel(name),
                            key: `${name}`,
                            extra: (
                              <CustomTooltip title={''}>
                                <CustomButton
                                  type={'text'}
                                  danger
                                  icon={<CloseOutlined />}
                                  onClick={() =>
                                    handleRemoveDetail(name, remove)
                                  }
                                />
                              </CustomTooltip>
                            ),
                            children: (
                              <CustomRow justify={'start'} gutter={[16, 1]}>
                                <CustomCol {...defaultBreakpoints}>
                                  <CustomFormItem
                                    {...restField}
                                    label={'Competencia'}
                                    name={[name, 'COMPETENCY_ID']}
                                    rules={[{ required: true }]}
                                    labelCol={{ span: 8 }}
                                  >
                                    <CustomSelect
                                      options={competencyOptions}
                                      placeholder={'Selecciona la competencia'}
                                      loading={isFetchingCompetencies}
                                      allowClear
                                      onSelect={(value) => {
                                        const item = competencies.find(
                                          (item) => item.COMPETENCY_ID === value
                                        )

                                        form.setFieldValue(
                                          [name, 'WEIGHT'] as never,
                                          item.WEIGHT
                                        )
                                      }}
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
                                      format={{ format: 'percent' }}
                                      min={0}
                                      max={100}
                                      placeholder="ID de asignación (opcional)"
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
                      </DetailContainer>
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
            </Container>
          </CustomSpace>
        </CustomRow>
      </CustomForm>
    </CustomModal>
  )
}

export default EvaluationForm
