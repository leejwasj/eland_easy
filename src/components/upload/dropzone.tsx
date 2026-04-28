'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadFile } from '@/app/(dashboard)/dashboard/[branchId]/upload/actions'
import { cn } from '@/lib/utils'

interface DropzoneProps {
  branchId: string
}

export function Dropzone({ branchId }: DropzoneProps) {
  const router = useRouter()
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()

  const isValidFile = (file: File) =>
    ['text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ].includes(file.type)

  const handleFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      toast.error('CSV 또는 Excel(.xlsx) 파일만 업로드 가능합니다')
      return
    }
    setSelectedFile(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleSubmit = () => {
    if (!selectedFile) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('branchId', branchId)

      const result = await uploadFile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('업로드 완료! 분석이 시작됩니다')
        router.push(`/dashboard/${branchId}`)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
          isDragOver
            ? 'border-[#2563EB] bg-blue-50'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <div>
              <p className="font-semibold text-emerald-700">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              파일 제거
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              isDragOver ? 'bg-[#2563EB]/10' : 'bg-slate-100'
            )}>
              {isDragOver
                ? <Upload className="w-8 h-8 text-[#2563EB]" />
                : <FileSpreadsheet className="w-8 h-8 text-slate-400" />
              }
            </div>
            <div>
              <p className="font-semibold text-slate-700">
                {isDragOver ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                CSV, Excel(.xlsx, .xls) 파일 지원
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 업로드 버튼 */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || isPending}
        className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
        size="lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            업로드 중...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            분석 시작
          </span>
        )}
      </Button>
    </div>
  )
}
