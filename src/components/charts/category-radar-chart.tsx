'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { GapCategory } from '@/types/database'

interface CategoryRadarChartProps {
  categories: GapCategory[]
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: { category: string; score: number } }[]
}) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-muted-foreground mb-0.5">{d.category}</p>
      <p className="text-sm font-semibold text-[#1E3A5F]">공백 점수: {d.score}</p>
    </div>
  )
}

export function CategoryRadarChart({ categories }: CategoryRadarChartProps) {
  const data = categories.map((c) => ({
    category: c.category_name.length > 8 ? c.category_name.slice(0, 8) + '…' : c.category_name,
    score: c.gap_score,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#64748B' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          dataKey="score"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: '#2563EB' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
