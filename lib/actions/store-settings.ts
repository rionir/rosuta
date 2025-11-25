'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateStoreSettingsInput {
  storeId: number
  approvalRequired: boolean
}

/**
 * 店舗設定を更新
 */
export async function updateStoreSettings(input: UpdateStoreSettingsInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('store_settings')
    .update({ approval_required: input.approvalRequired })
    .eq('store_id', input.storeId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/admin/stores')
  revalidatePath('/app/admin/settings')
  return { data: { id: data.id, store_id: data.store_id, approval_required: data.approval_required } }
}

/**
 * 店舗設定を取得
 */
export async function getStoreSettings(storeId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

