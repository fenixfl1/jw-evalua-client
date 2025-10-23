import {
  ClearOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Empty } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomPopover from 'src/components/custom/CustomPopover'
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTimeline from 'src/components/custom/CustomTimeline'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import {
  DashboardActivityFilters,
  DashboardActivityResponse,
} from 'src/services/dashboard/dashboard.types'
import { Metadata } from 'src/types/general'
import styled from 'styled-components'

const ACTIVITY_LIMIT = 15

const ACTIVITY_ACTION_META: Record<string, { label: string; color: string }> = {
  INSERT: { label: 'Creación', color: 'green' },
  UPDATE: { label: 'Actualización', color: 'blue' },
}

const HistoryContainer = styled.div`
  max-height: 450px;
  overflow-y: auto;
  padding: 10px;
`

const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/D'

interface ActivityHistoryProps {
  loading?: boolean
  dataSource: DashboardActivityResponse
  metadata: Metadata
  onOpenSearch?: (value: string) => void
  openSearch?: string
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  dataSource = {} as DashboardActivityResponse,
  metadata,
  loading,
  onOpenSearch,
  openSearch,
}) => {
  const [activityFilters, setActivityFilters] =
    useState<DashboardActivityFilters>({
      limit: ACTIVITY_LIMIT,
      offset: 0,
    })
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)

  const canLoadMore =
    metadata.totalPages > 0 && metadata.currentPage < metadata.totalPages
  const handleActivityActionChange = (value: string | number | null) => {
    setActivityFilters((prev) => ({
      ...prev,
      action: value ? (value as DashboardActivityFilters['action']) : undefined,
      offset: 0,
    }))
  }

  const handleDateRangeChange = (
    values: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(values)
    setActivityFilters((prev) => ({
      ...prev,
      dateFrom: values?.[0]?.startOf('day').toISOString(),
      dateTo: values?.[1]?.endOf('day').toISOString(),
      offset: 0,
    }))
  }

  const handleLoadMoreActivity = () => {
    if (!canLoadMore) return
    setActivityFilters((prev) => ({
      ...prev,
      offset: (prev.offset ?? 0) + (prev.limit ?? ACTIVITY_LIMIT),
    }))
  }

  const handleResetActivityFilters = () => {
    onOpenSearch('')
    setDateRange(null)
    setActivityFilters({
      limit: ACTIVITY_LIMIT,
      offset: 0,
    })
  }

  const getActivityMeta = useCallback(
    (action: string) =>
      ACTIVITY_ACTION_META[action] ?? { label: action, color: 'gray' },
    []
  )

  const renderActivityTag = useCallback(
    (action: string) => {
      const meta = getActivityMeta(action)
      return <CustomTag color={meta.color}>{meta.label}</CustomTag>
    },
    [getActivityMeta]
  )

  const activityTimelineItems = useMemo(
    () =>
      dataSource.items.map((item) => {
        const meta = getActivityMeta(item.action)

        return {
          color: meta.color,
          label: (
            <CustomText type="secondary">
              {formatDateTime(item.createdAt)}
            </CustomText>
          ),
          children: (
            <CustomSpace direction="vertical" size={2}>
              <CustomSpace direction="horizontal" size={8} align="center">
                {renderActivityTag(item.action)}
              </CustomSpace>
              <CustomText type="secondary">
                ID referencia: {String(item.objectId ?? 'N/A')}
              </CustomText>
              <CustomText type="secondary">
                Usuario: {item.username ?? 'N/A'}
              </CustomText>
              <CustomText type="secondary">
                Colaborador: {item.staffName ?? 'N/A'}
              </CustomText>
            </CustomSpace>
          ),
        }
      }),
    [dataSource.items, getActivityMeta, renderActivityTag]
  )

  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Actividad reciente</CustomTitle>
      </CustomDivider>
      <CustomSpace
        direction="horizontal"
        style={{ marginBottom: 12 }}
        align="center"
      >
        <CustomPopover
          trigger={'click'}
          content={
            <div style={{ width: '320px' }}>
              <CustomForm layout={'vertical'}>
                <CustomFormItem label={'Acción'}>
                  <CustomSelect
                    allowClear
                    placeholder={'Seleccionar'}
                    options={[
                      { label: 'Creación', value: 'INSERT' },
                      { label: 'Actualización', value: 'UPDATE' },
                    ]}
                    value={activityFilters.action}
                    onChange={(value) =>
                      handleActivityActionChange(value as string | null)
                    }
                  />
                </CustomFormItem>

                <CustomFormItem label={'Entidad'}>
                  <CustomInput
                    placeholder="Buscar por entidad"
                    value={openSearch}
                    onChange={(event) => onOpenSearch(event.target.value)}
                  />
                </CustomFormItem>

                <CustomFormItem label={'Rango de fecha'}>
                  <CustomRangePicker
                    width={'100%'}
                    value={dateRange ?? undefined}
                    onChange={(values) =>
                      handleDateRangeChange(
                        values as [Dayjs | null, Dayjs | null] | null
                      )
                    }
                  />
                </CustomFormItem>

                <CustomButton
                  icon={<ClearOutlined />}
                  type={'link'}
                  onClick={handleResetActivityFilters}
                >
                  Limpiar filtros
                </CustomButton>
              </CustomForm>
            </div>
          }
        >
          <CustomTooltip title={'Filtros'}>
            <CustomButton
              size={'large'}
              icon={<FilterOutlined />}
              type={'text'}
            />
          </CustomTooltip>
        </CustomPopover>
      </CustomSpace>

      <HistoryContainer>
        <CustomSpin spinning={loading}>
          <ConditionalComponent
            condition={!!dataSource.items.length}
            fallback={<Empty description="Sin actividades registradas" />}
          >
            <CustomTimeline mode="left" items={activityTimelineItems} />
          </ConditionalComponent>

          <ConditionalComponent condition={canLoadMore}>
            <CustomSpace
              direction="horizontal"
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CustomButton
                type={'link'}
                icon={<ReloadOutlined />}
                onClick={handleLoadMoreActivity}
              >
                Cargar más
              </CustomButton>
            </CustomSpace>
          </ConditionalComponent>
        </CustomSpin>
      </HistoryContainer>
    </CustomCol>
  )
}

export default ActivityHistory
