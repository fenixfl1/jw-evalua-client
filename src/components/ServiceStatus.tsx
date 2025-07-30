import React from 'react'
import CustomCard from './custom/CustomCard'
import { Card } from 'antd'
import CustomDivider from './custom/CustomDivider'
import CustomButton from './custom/CustomButton'
import { CircleOff, Cpu, Microchip, RefreshCcw, Settings } from 'lucide-react'
import CustomTooltip from './custom/CustomTooltip'
import CustomStatistic from './custom/CustomStatistic'
import CustomFlex from './custom/CustomFlex'
import { useNavigate } from 'react-router'
import { PATH_APPS } from 'src/constants/routes'
import { PM2Status } from 'src/hooks/use-pm2-status'
import capitalize from 'src/utils/capitalize'
import { CustomTitle } from './custom/CustomParagraph'

const { Meta } = Card

interface ServiceStatusProps {
  service: PM2Status
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ service }) => {
  const navigate = useNavigate()

  return (
    <CustomCard
      actions={[
        <CustomTooltip title={'Reiniciar servicio'}>
          <CustomButton type={'link'} icon={<RefreshCcw size={16} />} />
        </CustomTooltip>,
        <CustomTooltip title={'Detener Servicio'}>
          <CustomButton type={'link'} icon={<CircleOff size={16} />} />
        </CustomTooltip>,
        <CustomTooltip title={'Configuraciones'}>
          <CustomButton
            type={'link'}
            icon={<Settings size={16} />}
            onClick={() => {
              // setActiveKey([service])
              navigate(`${PATH_APPS}${service.name}`)
            }}
          />
        </CustomTooltip>,
      ]}
    >
      <Meta
        title={
          <CustomDivider>
            <CustomTitle level={4}>{capitalize(service.name)}</CustomTitle>
          </CustomDivider>
        }
      />
      <CustomFlex justify={'space-between'} wrap={false} gap={'middle'}>
        <CustomStatistic
          title="CPU"
          value={service.cpu}
          precision={2}
          valueStyle={{ color: '#3f8600' }}
          prefix={<Cpu size={15} />}
          suffix="%"
        />
        <CustomStatistic
          title="Memory"
          value={service.memory}
          // precision={2}
          valueStyle={{ color: '#3f8600' }}
          prefix={<Microchip size={15} />}
        />
      </CustomFlex>
    </CustomCard>
  )
}

export default ServiceStatus
