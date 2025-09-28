import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form } from 'antd'
import dayjs from 'dayjs'
import SmartTable from 'src/components/SmartTable'
import CustomSpin from 'src/components/custom/CustomSpin'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import StateSelector from 'src/components/StateSelector'
import { useGetEvaluationPaginationMutation } from 'src/services/evaluations/useGetEvaluationPaginationMutation'
import { useEvaluationStore } from 'src/store/evaluation.store'
import { useUpdateEvaluationMutation } from 'src/services/evaluations/useUpdateEvaluationMutation'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { AdvancedCondition } from 'src/types/general'
import useDebounce from 'src/hooks/use-debounce'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useGetPeriods } from 'src/hooks/use-get-periods'
import { ColumnsType } from 'antd/es/table'
import { Evaluation } from 'src/services/evaluations/evaluation.types'
import EvaluationForm from './components/EvaluationForm'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    PERIOD__EQ: '',
  },
}

const EvaluationPage: React.FC = () => {
  const [form] = Form.useForm()
  const { modal, notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey, 400)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedId, setSelectedId] = useState<number | undefined>()
  const setSelectedEvaluation = useEvaluationStore(
    (state) => state.setSelectedEvaluation
  )
  const { evaluations, metadata } = useEvaluationStore()
  const [periodOptions] = useGetPeriods()

  const { mutate: getEvaluations, isPending: isFetchingEvaluations } =
    useGetEvaluationPaginationMutation()
  const { mutateAsync: updateEvaluation, isPending: isUpdatingEvaluation } =
    useUpdateEvaluationMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage || 1, size = metadata.pageSize || 15) => {
      if (isFormOpen) return

      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const filterConditions = getConditionFromForm(FILTER)

      const condition: AdvancedCondition[] = [...filterConditions]

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      getEvaluations({ page, size, condition })
    },
    [
      debounce,
      getEvaluations,
      form,
      metadata.currentPage,
      metadata.pageSize,
      isFormOpen,
    ]
  )

  useEffect(handleSearch, [handleSearch])

  const handleOpenCreate = () => {
    setSelectedEvaluation(null)
    setSelectedId(undefined)
    setFormMode('create')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (evaluation: Evaluation) => {
    setSelectedEvaluation(null)
    setFormMode('edit')
    setSelectedId(evaluation.EVALUATION_ID)
    setIsFormOpen(true)
  }

  const handleToggleState = (evaluation: Evaluation) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Deseas actualizar el estado de la evaluación seleccionada?',
      onOk: async () => {
        try {
          await updateEvaluation({
            evaluationId: evaluation.EVALUATION_ID,
            STATE: evaluation.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operacion exitosa',
            description: 'El estado se actualizo correctamente.',
          })

          handleSearch()
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedId(undefined)
    setSelectedEvaluation(null)
  }

  const handleFormSuccess = () => {
    handleSearch()
    setSelectedEvaluation(null)
  }

  const tableColumns: ColumnsType<Evaluation> = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'EVALUATION_ID',
        key: 'EVALUATION_ID',
        width: 90,
      },
      {
        title: 'Modulo',
        dataIndex: 'MODULE_NAME',
        key: 'MODULE_NAME',
      },
      {
        title: 'Colaborador',
        dataIndex: 'STAFF_NAME',
        key: 'STAFF_NAME',
      },
      {
        title: 'Evaluador',
        dataIndex: 'EVALUATOR_NAME',
        key: 'EVALUATOR_NAME',
        render: (value?: string) => value || 'N/A',
      },
      {
        title: 'Periodo',
        dataIndex: 'PERIOD',
        key: 'PERIOD',
      },
      {
        title: 'Calificación (%)',
        dataIndex: 'OVERALL_SCORE',
        key: 'OVERALL_SCORE',
        render: (value?: number) =>
          value === undefined || value === null
            ? 'N/A'
            : `${Number(value).toFixed(1)}%`,
      },
      {
        title: 'Actualizado',
        dataIndex: 'UPDATED_AT',
        key: 'UPDATED_AT',
        render: (value?: string) =>
          value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A',
      },
    ],
    []
  )

  const filterContent = (
    <>
      <CustomFormItem
        label={'Estado'}
        name={['FILTER', 'STATE__IN']}
        labelCol={{ span: 24 }}
      >
        <StateSelector />
      </CustomFormItem>
      <CustomFormItem
        label={'Periodo'}
        name={['FILTER', 'PERIOD__EQ']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          allowClear
          placeholder={'Periodo (YYYYWW)'}
          options={periodOptions.map((period) => ({
            label: period.label,
            value: period.value,
          }))}
        />
      </CustomFormItem>
    </>
  )

  return (
    <>
      <CustomSpin spinning={isFetchingEvaluations || isUpdatingEvaluation}>
        <SmartTable
          columns={tableColumns}
          createText={'Nueva evaluation'}
          dataSource={evaluations}
          filter={filterContent}
          form={form}
          initialFilter={initialFilter}
          loading={isFetchingEvaluations}
          metadata={metadata}
          onChange={handleSearch}
          onCreate={handleOpenCreate}
          onEdit={(record) => handleOpenEdit(record as Evaluation)}
          onUpdate={(record) => handleToggleState(record as Evaluation)}
          onSearch={setSearchKey}
          rowKey={'EVALUATION_ID'}
        />
      </CustomSpin>

      <ConditionalComponent condition={isFormOpen}>
        <EvaluationForm
          open={isFormOpen}
          mode={formMode}
          evaluationId={selectedId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </ConditionalComponent>
    </>
  )
}

export default EvaluationPage
