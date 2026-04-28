'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBranch(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as string

  if (!name || !location || !type) return { error: '모든 항목을 입력해주세요' }

  const { error } = await supabase
    .from('branches')
    .insert({ name, location, type } as never)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}
