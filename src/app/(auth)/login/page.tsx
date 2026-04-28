import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-14 h-14 bg-[#1E3A5F] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1E3A5F]">이랜드 리테일</CardTitle>
          <CardDescription className="text-sm">카테고리 추천 대시보드</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
