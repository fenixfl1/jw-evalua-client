// WeeklyQualityChart.jsx
import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { useGoalStore } from 'src/store/goal.store'

// Util: formatea fecha a zona local (America/Santo_Domingo)
const formatDate = (isoStr: string) => {
  const d = new Date(isoStr)
  // Ej: "lun 13-oct"
  return new Intl.DateTimeFormat('es-DO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Santo_Domingo',
  })
    .format(d)
    .replace('.', '') // elimina puntos en abreviaturas según locale
}

const nfmt = new Intl.NumberFormat('es-DO')

const pctFmt = (v: unknown) =>
  `${(typeof v === 'number' ? v : Number(v)).toFixed(2)}%`

interface WeeklyQualityChartProps {
  height?: number
}

const WeeklyQualityChart: React.FC<WeeklyQualityChartProps> = ({
  height = 380,
}) => {
  const { moduleSummary } = useGoalStore()

  const chartData = useMemo(() => {
    const normalized = moduleSummary.map((d) => ({
      date: d.TARGET_DATE,
      dia: formatDate(d.TARGET_DATE),
      target: Number(d.TARGET_VALUE),
      actual: Number(d.ACTUAL_VALUE),
      targetAcc: Number(d.TARGET_VALUE_ACC),
      actualAcc: Number(d.ACTUAL_VALUE_ACC),
      compliance: Number(d.COMPLIANCE), // 0–100
    }))

    normalized.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    return normalized
  }, [moduleSummary])

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{ top: 12, right: 28, bottom: 8, left: 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 12 }}
            interval={0}
            height={40}
          />
          {/* Eje izquierdo: valores (unidades) */}
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            width={60}
            tickFormatter={(v) => nfmt.format(v)}
          />
          {/* Eje derecho: % cumplimiento */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[90, 105]} // ajusta si necesitas más rango
            tickFormatter={pctFmt}
            tick={{ fontSize: 12 }}
            width={50}
          />
          <Tooltip
            formatter={(value, name) => {
              if (
                name?.toString().includes('%') ||
                name?.toString().toLowerCase().includes('cumpl')
              ) {
                return [pctFmt(value), name]
              }
              return [nfmt.format(Number(value)), name]
            }}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload
              const d = item?.date ? new Date(item.date) : null
              const full = d
                ? new Intl.DateTimeFormat('es-DO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    timeZone: 'America/Santo_Domingo',
                  }).format(d)
                : label
              return full
            }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />

          {/* Barras diarias */}
          <Bar
            yAxisId="left"
            name="Target diario"
            dataKey="target"
            barSize={18}
          />
          <Bar
            yAxisId="left"
            name="Actual diario"
            dataKey="actual"
            barSize={18}
          />

          {/* Líneas acumuladas */}
          <Line
            yAxisId="left"
            name="Target acumulado"
            dataKey="targetAcc"
            dot={false}
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            name="Actual acumulado"
            dataKey="actualAcc"
            dot={false}
            strokeWidth={2}
          />

          {/* Cumplimiento % (eje derecho) */}
          <Line
            yAxisId="right"
            name="Cumplimiento %"
            dataKey="compliance"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyQualityChart
