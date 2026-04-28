'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface BarData {
  name: string
  score: number
  branchId: string
}

interface GapScoreBarChartProps {
  data: BarData[]
  onBarClick?: (branchId: string) => void
}

function getBarColor(score: number) {
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#94A3B8'
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#1E3A5F]">공백 점수: {payload[0].value}</p>
    </div>
  )
}

export function GapScoreBarChart({ data, onBarClick }: GapScoreBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        분석된 지점이 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={data.length > 5 ? -30 : 0}
          textAnchor={data.length > 5 ? 'end' : 'middle'}
          height={data.length > 5 ? 48 : 24}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={48}
          onClick={(d) => onBarClick?.((d as unknown as BarData).branchId)}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
