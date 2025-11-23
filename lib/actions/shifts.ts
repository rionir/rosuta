'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export interface CreateShiftInput {
  userId: string
  storeId: number
  scheduledStart: string // ISO 8601 TIMESTAMP
  scheduledEnd: string // ISO 8601 TIMESTAMP
  createdBy: string
}

export interface UpdateShiftInput {
  shiftId: number
  scheduledStart?: string
  scheduledEnd?: string
}

/**
 * シフトを作成
 */
export async function createShift(input: CreateShiftInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shifts')
    .insert({
      user_id: input.userId,
      store_id: input.storeId,
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd,
      created_by: input.createdBy,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // キャッシュを無効化
  revalidateTag(`shifts-store-${input.storeId}`, 'max')
  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { 
    data: { 
      id: data.id, 
      user_id: data.user_id, 
      store_id: data.store_id, 
      scheduled_start: data.scheduled_start, 
      scheduled_end: data.scheduled_end, 
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    } 
  }
}

/**
 * シフトを更新
 */
export async function updateShift(input: UpdateShiftInput) {
  const supabase = await createClient()

  const updates: { scheduled_start?: string; scheduled_end?: string } = {}
  if (input.scheduledStart) updates.scheduled_start = input.scheduledStart
  if (input.scheduledEnd) updates.scheduled_end = input.scheduledEnd

  const { data, error } = await supabase
    .from('shifts')
    .update(updates)
    .eq('id', input.shiftId)
    .select('id, user_id, store_id, scheduled_start, scheduled_end, created_by, created_at, updated_at')
    .single()

  if (error) {
    return { error: error.message }
  }

  // キャッシュを無効化
  if (data) {
    revalidateTag(`shifts-store-${data.store_id}`, 'max')
  }
  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { data }
}

/**
 * シフトを削除
 */
export async function deleteShift(shiftId: number) {
  const supabase = await createClient()

  // 削除前にstoreIdを取得
  const { data: shiftData } = await supabase
    .from('shifts')
    .select('store_id')
    .eq('id', shiftId)
    .single()

  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', shiftId)

  if (error) {
    return { error: error.message }
  }

  // キャッシュを無効化
  if (shiftData) {
    revalidateTag(`shifts-store-${shiftData.store_id}`, 'max')
  }
  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { data: { success: true } }
}

/**
 * ユーザーのシフト一覧を取得（日付範囲指定）
 */
export async function getUserShifts(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const supabase = await createClient()

  let query = supabase
    .from('shifts')
    .select(`
      *,
      company_stores (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('scheduled_start', `${startDate}T00:00:00`)
    .lte('scheduled_start', `${endDate}T23:59:59`)
    .order('scheduled_start', { ascending: true })

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 店舗のシフト一覧を取得（日付範囲指定）
 * 注意: ユーザー情報は含まれません。呼び出し側でstoreUsersからマージしてください。
 */
export async function getStoreShifts(
  storeId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shifts')
    .select('id, user_id, store_id, scheduled_start, scheduled_end, created_by, created_at, updated_at')
    .eq('store_id', storeId)
    .gte('scheduled_start', `${startDate}T00:00:00`)
    .lte('scheduled_start', `${endDate}T23:59:59`)
    .order('scheduled_start', { ascending: true })

  if (error) {
    console.error('getStoreShifts error:', error)
    return { error: error.message }
  }

  return { data: data || [] }
}

