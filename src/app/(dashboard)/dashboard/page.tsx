import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BranchCard } from '@/components/dashboard/branch-card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, TrendingUp, Clock, Plus, Search } from 'lucide-react'
import type { BranchRow, GapCategory } from '@/types/database'
import { cn } from '@/lib/utils'

interface BranchWithUploads extends BranchRow {
  uploads: {
    id: string
    version: number
    uploaded_at: string
    analyses: { id: string; status: string; result_json: unknown }[]
  }[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('branches')
    .select(`
      id, name, location, type, updated_at, created_at,
      uploads(
        id, version, uploaded_at,
        analyses(id, status, result_json)
      )
    `)
    .order('updated_at', { ascending: false })

  const branchList = (data as unknown as BranchWithUploads[]) ?? []
  const totalBranches = branchList.length

  const analyzed = branchList.filter(b =>
    b.uploads?.some(u => u.analyses?.some(a => a.status === 'completed'))
  ).length

  const allScores = branchList.flatMap(b =>
    b.uploads?.flatMap(u =>
      u.analyses?.flatMap(a =>
        (a.result_json as { gap_categories?: GapCategory[] } | null)?.gap_categories?.map(c => c.gap_score) ?? []
      ) ?? []
    ) ?? []
  )
  const avgGap = allScores.length > 0
    ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
    : 0

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">전체 지점 현황</h1>
          <p className="text-sm text-muted-foreground mt-1">
            상권 데이터를 업로드하고 카테고리 공백을 분석하세요
          </p>
        </div>
        <Link href="/admin" className={cn(buttonVariants(), 'bg-[#2563EB] hover:bg-[#1d4ed8]')}>
          <Plus className="w-4 h-4 mr-2" />
          지점 추가
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="전체 지점" value={totalBranches} sub="등록된 지점 수" icon={Building2} accent="blue" />
        <StatsCard
          title="분석 완료"
          value={analyzed}
          sub={`${totalBranches > 0 ? Math.round((analyzed / totalBranches) * 100) : 0}% 완료율`}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatsCard title="평균 공백 점수" value={avgGap || '-'} sub="높을수록 공백 가능성 높음" icon={Clock} accent="amber" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="지점명 또는 상권명 검색" className="pl-9 bg-white" />
      </div>

      {branchList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-600 mb-2">등록된 지점이 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-6">
            관리자 페이지에서 지점을 추가하고 상권 데이터를 업로드하세요
          </p>
          <Link href="/admin" className={cn(buttonVariants(), 'bg-[#2563EB] hover:bg-[#1d4ed8]')}>
            <Plus className="w-4 h-4 mr-2" />
            첫 지점 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchList.map((branch) => {
            const latestUpload = branch.uploads?.[0]
            const latestAnalysis = latestUpload?.analyses?.[0]
            const gapCategories = (latestAnalysis?.result_json as { gap_categories?: GapCategory[] } | null)?.gap_categories ?? []
            const avgScore = gapCategories.length > 0
              ? Math.round(gapCategories.reduce((s, c) => s + c.gap_score, 0) / gapCategories.length)
              : undefined

            return (
              <BranchCard
                key={branch.id}
                id={branch.id}
                name={branch.name}
                location={branch.location}
                type={branch.type}
                gapScore={avgScore}
                lastUpdated={latestUpload
                  ? new Date(latestUpload.uploaded_at).toLocaleDateString('ko-KR')
                  : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
