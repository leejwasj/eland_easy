import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buttonVariants } from '@/components/ui/button'
import { MapPin, Upload, GitCompare, AlertCircle, Radar, LayoutGrid } from 'lucide-react'
import { CategoryRadarChart } from '@/components/charts/category-radar-chart'
import { GapScoreTrendChart } from '@/components/charts/gap-score-trend-chart'
import { RecommendationCard } from '@/components/dashboard/recommendation-card'
import type { BranchRow, GapCategory, AnalysisStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface AnalysisRecord {
  id: string
  status: AnalysisStatus
  result_json: unknown
  completed_at: string | null
}

interface UploadWithAnalysis {
  id: string
  version: number
  file_name: string
  uploaded_at: string
  analyses: AnalysisRecord[]
}

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()

  const { data: branchData } = await supabase
    .from('branches')
    .select('id, name, location, type, created_at, updated_at')
    .eq('id', branchId)
    .single()

  if (!branchData) notFound()
  const branch = branchData as unknown as BranchRow

  // 전체 업로드 이력 (트렌드용)
  const { data: uploadsData } = await supabase
    .from('uploads')
    .select('id, version, file_name, uploaded_at, analyses(id, status, result_json, completed_at)')
    .eq('branch_id', branchId)
    .order('version', { ascending: false })

  const uploads = (uploadsData as unknown as UploadWithAnalysis[]) ?? []
  const latestUpload = uploads[0] ?? null
  const analysis = latestUpload?.analyses?.[0] ?? null
  const gapCategories: GapCategory[] =
    (analysis?.result_json as { gap_categories?: GapCategory[] } | null)?.gap_categories ?? []

  // 트렌드 데이터
  const trendData = [...uploads]
    .reverse()
    .map((u) => {
      const cats = (u.analyses?.[0]?.result_json as { gap_categories?: GapCategory[] } | null)?.gap_categories ?? []
      const avg = cats.length > 0
        ? Math.round(cats.reduce((s, c) => s + c.gap_score, 0) / cats.length)
        : null
      return avg !== null
        ? { version: `v${u.version}`, score: avg, date: new Date(u.uploaded_at).toLocaleDateString('ko-KR') }
        : null
    })
    .filter(Boolean) as { version: string; score: number; date: string }[]

  const avgScore = gapCategories.length > 0
    ? Math.round(gapCategories.reduce((s, c) => s + c.gap_score, 0) / gapCategories.length)
    : null

  const topGap = gapCategories.length > 0
    ? [...gapCategories].sort((a, b) => b.gap_score - a.gap_score)[0]
    : null

  return (
    <div className="max-w-5xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{branch.name}</h1>
            <Badge variant="secondary">{branch.type}</Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {branch.location}
          </div>
        </div>
        <div className="flex gap-2">
          {uploads.length >= 2 && (
            <Link
              href={`/dashboard/${branchId}/compare`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <GitCompare className="w-4 h-4 mr-1.5" />
              버전 비교
            </Link>
          )}
          <Link
            href={`/dashboard/${branchId}/upload`}
            className={cn(buttonVariants({ size: 'sm' }), 'bg-[#2563EB] hover:bg-[#1d4ed8]')}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            데이터 업로드
          </Link>
        </div>
      </div>

      {/* 분석 없음 */}
      {!latestUpload || !analysis ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-600 mb-1">분석 데이터가 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-5">
              상권 데이터 파일을 업로드하면 자동으로 분석이 시작됩니다
            </p>
            <Link
              href={`/dashboard/${branchId}/upload`}
              className={cn(buttonVariants(), 'bg-[#2563EB] hover:bg-[#1d4ed8]')}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              데이터 업로드
            </Link>
          </CardContent>
        </Card>
      ) : analysis.status === 'pending' || analysis.status === 'processing' ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="font-semibold text-amber-800">분석 진행 중</p>
              <p className="text-sm text-amber-600">
                v{latestUpload.version} — {latestUpload.file_name} 분석 중입니다
              </p>
            </div>
          </CardContent>
        </Card>
      ) : analysis.status === 'failed' ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <p className="font-semibold text-red-700">분석 실패</p>
            <p className="text-sm text-red-600 mt-1">다시 업로드를 시도해 주세요</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">최신 버전</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">v{latestUpload.version}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(latestUpload.uploaded_at).toLocaleDateString('ko-KR')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">공백 카테고리</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">{gapCategories.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">평균 공백 점수</p>
                <p className="text-2xl font-bold text-emerald-600">{avgScore ?? '-'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">최고 공백</p>
                <p className="text-sm font-bold text-[#1E3A5F] truncate mt-1">{topGap?.category_name ?? '-'}</p>
                {topGap && (
                  <Badge className="mt-1 bg-emerald-500 text-xs">{topGap.gap_score}점</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 차트 + 추천 탭 */}
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart" className="gap-1.5">
                <Radar className="w-3.5 h-3.5" />
                레이더 차트
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                추천 브랜드
              </TabsTrigger>
            </TabsList>

            {/* 레이더 차트 탭 */}
            <TabsContent value="chart" className="mt-4 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <Card className="col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">카테고리별 공백 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryRadarChart categories={gapCategories} />
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">공백 점수 순위</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[...gapCategories]
                      .sort((a, b) => b.gap_score - a.gap_score)
                      .slice(0, 6)
                      .map((cat, i) => (
                        <div key={cat.category_id} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-medium truncate">{cat.category_name}</span>
                              <span className="text-xs font-semibold shrink-0 ml-2">{cat.gap_score}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  cat.gap_score >= 70 ? 'bg-emerald-500' :
                                  cat.gap_score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${cat.gap_score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>

              {/* 트렌드 */}
              {trendData.length >= 2 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">버전별 공백 점수 추이</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GapScoreTrendChart data={trendData} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 추천 브랜드 탭 */}
            <TabsContent value="recommendations" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...gapCategories]
                  .sort((a, b) => b.gap_score - a.gap_score)
                  .map((cat) => (
                    <RecommendationCard
                      key={cat.category_id}
                      categoryName={cat.category_name}
                      gapScore={cat.gap_score}
                      recommendations={cat.recommendations ?? []}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
