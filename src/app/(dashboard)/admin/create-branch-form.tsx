'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBranch } from './actions'

const BRANCH_TYPES = ['복합쇼핑몰', '대형마트', '아울렛', '백화점', '슈퍼마켓', '기타']

export function CreateBranchForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState('')

  async function handleSubmit(formData: FormData) {
    formData.set('type', type)
    startTransition(async () => {
      const result = await createBranch(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('지점이 추가되었습니다')
        onSuccess?.()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">지점명 *</Label>
        <Input id="name" name="name" placeholder="예: 이마트 홍대점" required disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">위치 *</Label>
        <Input id="location" name="location" placeholder="예: 서울시 마포구 홍대입구" required disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label>상권 유형 *</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? '')} required>
          <SelectTrigger>
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {BRANCH_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={isPending || !type}
        className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
      >
        {isPending ? '저장 중...' : '지점 추가'}
      </Button>
    </form>
  )
}
