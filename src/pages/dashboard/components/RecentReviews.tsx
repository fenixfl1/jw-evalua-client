import { Empty } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomTitle, CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { DashboardSummaryResponse } from 'src/services/dashboard/dashboard.types'
import formatter from 'src/utils/formatter'

const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/D'

interface RecentReviewsProps {
  summary: DashboardSummaryResponse
}

const RecentReviews: React.FC<RecentReviewsProps> = ({
  summary = {} as DashboardSummaryResponse,
}) => {
  return (
    <CustomCol xs={24}>
      <CustomDivider>
        <CustomTitle level={5}>Evaluaciones recientes</CustomTitle>
      </CustomDivider>
      <ConditionalComponent
        condition={!!summary.recentEvaluations.length}
        fallback={<Empty description="Sin evaluaciones registradas" />}
      >
        <CustomList
          pagination={{ pageSize: 6 }}
          dataSource={summary.recentEvaluations.slice(0, 8)}
          renderItem={(item) => (
            <CustomListItem
              extra={
                <CustomSpace
                  direction="vertical"
                  size={0}
                  align="end"
                  width={'max-content'}
                >
                  <CustomText strong>
                    {item.overallScore !== null
                      ? formatter({
                          value: item.overallScore,
                          format: 'percentage',
                          fix: 1,
                        })
                      : 'N/D'}
                  </CustomText>
                  <CustomText type="secondary">
                    {formatDateTime(item.updatedAt)}
                  </CustomText>
                </CustomSpace>
              }
            >
              <CustomListItemMeta
                title={item.staffName ?? 'Evaluación sin asignación'}
                description={
                  <CustomSpace direction="vertical" size={0}>
                    <CustomText type="secondary">{item.moduleName}</CustomText>
                    <CustomText type="secondary">
                      Periodo: {item.periodLabel}
                    </CustomText>
                  </CustomSpace>
                }
              />
            </CustomListItem>
          )}
        />
      </ConditionalComponent>
    </CustomCol>
  )
}

export default RecentReviews
