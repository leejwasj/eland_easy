import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1E3A5F]">이랜드 리테일</CardTitle>
          <CardDescription>카테고리 추천 대시보드에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">로그인 폼 구현 예정</p>
        </CardContent>
      </Card>
    </div>
  )
}
