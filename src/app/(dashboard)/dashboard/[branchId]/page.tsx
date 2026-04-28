import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { MapPin, Upload, GitCompare, TrendingUp, Star, AlertCircle } from 'lucide-react'
import type { BranchRow, GapCategory, AnalysisStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface UploadWithAnalysis {
  id: string
  version: number
  file_name: string
  uploaded_at: string
  analyses: { id: string; status: AnalysisStatus; result_json: unknown; completed_at: string | null }[]
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

  const { data: uploadData } = await supabase
    .from('uploads')
    .select('id, version, file_name, uploaded_at, analyses(id, status, result_json, completed_at)')
    .eq('branch_id', branchId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestUpload = uploadData as unknown as UploadWithAnalysis | null
  const analysis = latestUpload?.analyses?.[0]
  const gapCategories: GapCategory[] =
    (analysis?.result_json as { gap_categories?: GapCategory[] } | null)?.gap_categories ?? []

  return (
    <div className="max-w-5xl space-y-6">
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
          {latestUpload && (
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
                v{latestUpload.version} — {latestUpload.file_name} 분석 중입니다. 잠시 기다려 주세요.
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
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">분석 버전</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">v{latestUpload.version}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(latestUpload.uploaded_at).toLocaleDateString('ko-KR')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">공백 카테고리</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">{gapCategories.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">평균 공백 점수</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {gapCategories.length > 0
                    ? Math.round(gapCategories.reduce((s, c) => s + c.gap_score, 0) / gapCategories.length)
                    : '-'}
                </p>
              </CardContent>
            </Card>
          </div>

          {gapCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                  공백 카테고리 TOP {gapCategories.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...gapCategories]
                  .sort((a, b) => b.gap_score - a.gap_score)
                  .map((cat) => (
                    <div key={cat.category_id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#1E3A5F]">{cat.category_name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">공백 점수</span>
                          <Badge className={
                            cat.gap_score >= 70 ? 'bg-emerald-500' :
                            cat.gap_score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                          }>
                            {cat.gap_score}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            cat.gap_score >= 70 ? 'bg-emerald-500' :
                            cat.gap_score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${cat.gap_score}%` }}
                        />
                      </div>
                      {cat.recommendations?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            추천 브랜드
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cat.recommendations.slice(0, 5).map((rec) => (
                              <Badge
                                key={rec.brand}
                                variant={rec.is_eland_brand ? 'default' : 'secondary'}
                                className={rec.is_eland_brand ? 'bg-[#1E3A5F]' : ''}
                              >
                                {rec.is_eland_brand && '⭐ '}{rec.brand}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
