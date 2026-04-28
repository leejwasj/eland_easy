'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendPoint {
  version: string
  score: number
  date: string
}

interface GapScoreTrendChartProps {
  data: TrendPoint[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; payload: TrendPoint }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-muted-foreground mb-0.5">{label} · {payload[0].payload.date}</p>
      <p className="text-sm font-semibold text-[#1E3A5F]">평균 공백 점수: {payload[0].value}</p>
    </div>
  )
}

export function GapScoreTrendChart({ data }: GapScoreTrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        버전이 2개 이상 있어야 추이를 확인할 수 있습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="version" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563EB"
          strokeWidth={2}
          dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
