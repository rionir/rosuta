'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateStoreInput {
  companyId: number
  name: string
  address?: string
}

export interface UpdateStoreInput {
  storeId: number
  name?: string
  address?: string
}

/**
 * 店舗を作成
 */
export async function createStore(input: CreateStoreInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_stores')
    .insert({
      company_id: input.companyId,
      name: input.name,
      address: input.address,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 店舗設定をデフォルトで作成
  await supabase.from('store_settings').insert({
    store_id: data.id,
    approval_required: false,
  })

  revalidatePath('/app/admin/stores')
  return { data }
}

/**
 * 店舗情報を更新
 */
export async function updateStore(input: UpdateStoreInput) {
  const supabase = await createClient()

  const updates: { name?: string; address?: string } = {}
  if (input.name) updates.name = input.name
  if (input.address !== undefined) updates.address = input.address

  const { data, error } = await supabase
    .from('company_stores')
    .update(updates)
    .eq('id', input.storeId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/admin/stores')
  return { data }
}

/**
 * 企業に所属する店舗一覧を取得
 */
export async function getCompanyStores(companyId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_stores')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 店舗情報を取得
 */
export async function getStore(storeId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

