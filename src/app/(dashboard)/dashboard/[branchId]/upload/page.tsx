import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Dropzone } from '@/components/upload/dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, History } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AnalysisStatus, BranchRow } from '@/types/database'

interface UploadRecord {
  id: string
  version: number
  file_name: string
  uploaded_at: string
  analyses: { status: AnalysisStatus }[]
}

const statusLabel = (status: AnalysisStatus | undefined) => {
  if (status === 'completed') return '완료'
  if (status === 'processing') return '분석중'
  if (status === 'failed') return '실패'
  return '대기'
}

const statusClass = (status: AnalysisStatus | undefined) => {
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'processing') return 'bg-amber-500'
  if (status === 'failed') return 'bg-red-500'
  return ''
}

export default async function UploadPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params
  const supabase = await createClient()

  const { data: branchData } = await supabase
    .from('branches')
    .select('id, name, location, type')
    .eq('id', branchId)
    .single()

  if (!branchData) notFound()
  const branch = branchData as unknown as BranchRow

  const { data: uploadsData } = await supabase
    .from('uploads')
    .select('id, version, file_name, uploaded_at, analyses(status)')
    .eq('branch_id', branchId)
    .order('version', { ascending: false })
    .limit(5)

  const uploads = (uploadsData as unknown as UploadRecord[]) ?? []

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/dashboard/${branchId}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground')}
        >
          <ArrowLeft className="w-4 h-4" />
          {branch.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">데이터 업로드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          상권 분석 데이터 (CSV / Excel) 를 업로드하면 자동으로 분석이 시작됩니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">파일 선택</CardTitle>
          <CardDescription>
            컬럼: 업종명, 매출액, 유동인구, 면적 등이 포함된 파일을 업로드하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone branchId={branchId} />
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              업로드 이력
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploads.map((upload) => {
                const status = upload.analyses?.[0]?.status
                return (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">v{upload.version} — {upload.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(upload.uploaded_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <Badge
                      variant={status === 'completed' ? 'default' : 'secondary'}
                      className={statusClass(status)}
                    >
                      {statusLabel(status)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
