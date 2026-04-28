import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateBranchForm } from './create-branch-form'
import { Building2, MapPin } from 'lucide-react'
import type { BranchRow } from '@/types/database'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('branches')
    .select('id, name, location, type, created_at, updated_at')
    .order('created_at', { ascending: false })

  const branches = (data as unknown as BranchRow[]) ?? []

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">관리자</h1>
        <p className="text-sm text-muted-foreground mt-1">지점 및 사용자를 관리합니다</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">새 지점 추가</CardTitle>
              <CardDescription>분석할 지점 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateBranchForm />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                등록된 지점 ({branches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  등록된 지점이 없습니다
                </p>
              ) : (
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{branch.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {branch.location}
                        </div>
                      </div>
                      <Badge variant="secondary">{branch.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
