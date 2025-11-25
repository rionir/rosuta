'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export interface AssignUserToStoreInput {
  userId: string
  storeId: number
}

export interface UpdateUserStoreInput {
  userId: string
  storeId: number
  isActive: boolean
}

/**
 * ユーザーを店舗に所属させる
 */
export async function assignUserToStore(input: AssignUserToStoreInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .insert({
      user_id: input.userId,
      store_id: input.storeId,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    // 既に存在する場合は更新
    if (error.code === '23505') {
      const { data: updateData, error: updateError } = await supabase
        .from('user_stores')
        .update({ is_active: true })
        .eq('user_id', input.userId)
        .eq('store_id', input.storeId)
        .select()
        .single()

      if (updateError) {
        return { error: updateError.message }
      }

      // キャッシュを無効化
      revalidateTag(`store-users-${input.storeId}`, 'max')
      revalidatePath('/app/admin/users')
      return { data: updateData }
    }

    return { error: error.message }
  }

  revalidatePath('/app/admin/users')
  return { data }
}

/**
 * ユーザーの店舗所属を更新
 */
export async function updateUserStore(input: UpdateUserStoreInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .update({ is_active: input.isActive })
    .eq('user_id', input.userId)
    .eq('store_id', input.storeId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // キャッシュを無効化
  if (data) {
    revalidateTag(`store-users-${data.store_id}`, 'max')
  }
  revalidatePath('/app/admin/users')
  return { data }
}

/**
 * ユーザーが所属する店舗一覧を取得
 */
export async function getUserStores(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      *,
      company_stores (
        id,
        name,
        address,
        company_id
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 店舗に所属するユーザー一覧を取得
 */
export async function getStoreUsers(storeId: number) {
  const supabase = await createClient()

  // user_storesテーブル経由でusersテーブルとJOINして取得
  // user_storesテーブルには管理者用のSELECTポリシーを追加済み
  // usersテーブルのRLSポリシー「Admins can view users in their companies」が適用される
  // ただし、user_stores経由でJOINすることで、RLSポリシーが正しく評価される可能性がある
  const { data, error } = await supabase
    .from('user_stores')
    .select(`
      user_id,
      store_id,
      is_active,
      created_at,
      users!user_stores_user_id_fkey (
        id,
        last_name,
        first_name
      )
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getStoreUsers error:', error)
    console.error('getStoreUsers error code:', error.code)
    console.error('getStoreUsers error message:', error.message)
    return { error: error.message }
  }

  // usersが配列の場合、最初の要素を取得（1対1の関係なので）
  const formattedData = (data || []).map((item: any) => ({
    user_id: item.user_id,
    store_id: item.store_id,
    is_active: item.is_active,
    created_at: item.created_at,
    users: Array.isArray(item.users) ? item.users[0] || null : item.users,
  }))

  return { data: formattedData }
}

