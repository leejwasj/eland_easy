'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadFile(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const branchId = formData.get('branchId') as string

  if (!file || file.size === 0) return { error: '파일을 선택해주세요' }

  const allowedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  if (!allowedTypes.includes(file.type)) {
    return { error: 'CSV 또는 Excel 파일만 업로드 가능합니다' }
  }

  const { data: latestUpload } = await supabase
    .from('uploads')
    .select('version')
    .eq('branch_id', branchId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestVersion = (latestUpload as { version: number } | null)?.version ?? 0
  const nextVersion = latestVersion + 1
  const fileName = `${branchId}/${nextVersion}_${Date.now()}_${file.name}`

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(fileName, file)

  if (storageError) return { error: `파일 업로드 실패: ${storageError.message}` }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName)

  const { data: upload, error: dbError } = await supabase
    .from('uploads')
    .insert({
      branch_id: branchId,
      version: nextVersion,
      file_url: publicUrl,
      file_name: file.name,
    } as never)
    .select('id')
    .single()

  if (dbError) return { error: `DB 저장 실패: ${dbError.message}` }

  const uploadId = (upload as { id: string }).id

  await supabase
    .from('analyses')
    .insert({ upload_id: uploadId, status: 'pending' } as never)

  revalidatePath(`/dashboard/${branchId}`)
  return { success: true, uploadId }
}
