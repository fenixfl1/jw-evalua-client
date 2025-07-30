import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import CustomCard from './custom/CustomCard'
import { useCPUStats } from 'src/hooks/use-cpu-status'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

interface CPUMonitorProps {
  services: string[]
}

const serviceColors = ['#4ade80', '#3b82f6', '#facc15', '#f87171', '#a78bfa']

const CPUMonitor: React.FC<CPUMonitorProps> = ({ services }) => {
  const dataPoints = useCPUStats(services)

  const labels = dataPoints.map((d) => d.time)

  const datasets = services.map((service, index) => ({
    label: `${service} (%)`,
    data: dataPoints.map((d) => d.usageByService[service]),
    borderColor: serviceColors[index % serviceColors.length],
    backgroundColor: serviceColors[index % serviceColors.length],
    fill: false,
    tension: 0.3,
    pointRadius: 2,
  }))

  const data = { labels, datasets }

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'CPU (%)',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  }

  return (
    <CustomCard title="Uso de CPU">
      <Line style={{ maxHeight: '250px' }} data={data} options={options} />
    </CustomCard>
  )
}

export default CPUMonitor
