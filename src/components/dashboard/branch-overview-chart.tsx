'use client'

import { useRouter } from 'next/navigation'
import { GapScoreBarChart } from '@/components/charts/gap-score-bar-chart'

interface Props {
  data: { name: string; score: number; branchId: string }[]
}

export function BranchOverviewChart({ data }: Props) {
  const router = useRouter()
  return (
    <GapScoreBarChart
      data={data}
      onBarClick={(branchId) => router.push(`/dashboard/${branchId}`)}
    />
  )
}
